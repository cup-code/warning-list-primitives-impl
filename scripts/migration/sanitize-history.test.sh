#!/usr/bin/env bash
set -euo pipefail

root=$(mktemp -d "${TMPDIR:-/tmp}/sanitize-history-test.XXXXXX")
trap 'rm -rf "$root"' EXIT

repo="$root/repo"
map_file="$root/commit-map.txt"
git init -q "$repo"
git -C "$repo" config user.name 'History Tester'
git -C "$repo" config user.email 'history@example.com'

commit_file() {
  local date=$1 message=$2 file=$3 content=$4
  mkdir -p "$repo/$(dirname "$file")"
  printf '%s\n' "$content" > "$repo/$file"
  git -C "$repo" add "$file"
  GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" \
    git -C "$repo" commit -q -m "$message"
}

commit_file '2024-01-01T01:02:03+0800' 'initial source' src/main.js 'one'
base=$(git -C "$repo" rev-parse HEAD)
git -C "$repo" switch -q -c feature
commit_file '2024-01-02T02:03:04+0800' 'feature with generated files' nested/node_modules/pkg/index.js 'generated'
commit_file '2024-01-03T03:04:05+0800' 'feature source' src/feature.js 'feature'
git -C "$repo" switch -q -c sanitized "$base"
commit_file '2024-01-04T04:05:06+0800' 'main with credentials' config/.npmrc 'token=secret'
GIT_AUTHOR_DATE='2024-01-05T05:06:07+0800' GIT_COMMITTER_DATE='2024-01-05T05:06:07+0800' \
  git -C "$repo" merge -q --no-ff feature -m 'merge feature'
commit_file '2024-01-06T06:07:08+0800' 'more excluded outputs' packages/app/dist/index.js 'bundle'
commit_file '2024-01-07T07:08:09+0800' 'cache and system files' packages/app/.cache/value 'cache'
mkdir -p "$repo/packages/app/.rsbuild-cache"
printf 'cache\n' > "$repo/packages/app/.rsbuild-cache/value"
printf 'metadata\n' > "$repo/packages/app/.DS_Store"
git -C "$repo" add packages/app/.rsbuild-cache/value packages/app/.DS_Store
GIT_AUTHOR_DATE='2024-01-07T07:08:09+0800' GIT_COMMITTER_DATE='2024-01-07T07:08:09+0800' \
  git -C "$repo" commit -q --amend --no-edit

before_count=$(git -C "$repo" rev-list --count sanitized)
git -C "$repo" rev-list sanitized > "$root/old-commits.txt"
while read -r commit; do
  git -C "$repo" show -s --format='%an%x00%ae%x00%aI%x00%cn%x00%ce%x00%cI%x00%B' "$commit" > "$root/meta-$commit"
  git -C "$repo" show -s --format='%P' "$commit" > "$root/parents-$commit"
done < "$root/old-commits.txt"

"$(dirname "$0")/sanitize-history.sh" "$repo" sanitized "$map_file"

after_count=$(git -C "$repo" rev-list --count sanitized)
map_count=$(wc -l < "$map_file" | tr -d ' ')
test "$before_count" -eq "$after_count"
test "$before_count" -eq "$map_count"

excluded='(?:^|/)(?:\.npmrc|\.DS_Store)$|(?:^|/)(?:node_modules|dist|\.cache|\.rsbuild-cache)(?:/|$)'
while read -r commit; do
  test -z "$(git -C "$repo" ls-tree -r --name-only "$commit" | perl -ne "print if m{$excluded}")"
done < <(git -C "$repo" rev-list sanitized)

while read -r old new; do
  test -n "$old"
  test -n "$new"
  git -C "$repo" cat-file -e "$new^{commit}"
  git -C "$repo" show -s --format='%an%x00%ae%x00%aI%x00%cn%x00%ce%x00%cI%x00%B' "$new" > "$root/new-meta"
  cmp "$root/meta-$old" "$root/new-meta"

  expected_parents=''
  for old_parent in $(cat "$root/parents-$old"); do
    new_parent=$(awk -v old="$old_parent" '$1 == old { print $2 }' "$map_file")
    expected_parents="${expected_parents:+$expected_parents }$new_parent"
  done
  actual_parents=$(git -C "$repo" show -s --format='%P' "$new")
  test "$expected_parents" = "$actual_parents"
done < "$map_file"

echo "sanitize-history test passed: commits=$after_count mappings=$map_count"
