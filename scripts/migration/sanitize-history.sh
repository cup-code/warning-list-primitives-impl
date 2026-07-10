#!/usr/bin/env bash
set -euo pipefail

repo=${1:?缺少仓库目录}
branch=${2:?缺少待净化分支}
map_file=${3:?缺少 SHA 映射输出文件}

repo=$(cd "$repo" && pwd)
mkdir -p "$(dirname "$map_file")"
map_file=$(cd "$(dirname "$map_file")" && pwd)/$(basename "$map_file")
: > "$map_file"

work_dir=$(mktemp -d "${TMPDIR:-/tmp}/sanitize-history.XXXXXX")
trap 'rm -rf "$work_dir"' EXIT

git -C "$repo" rev-parse --verify "$branch^{commit}" >/dev/null
git -C "$repo" rev-list "$branch" | sort > "$work_dir/old-commits.txt"
before_count=$(wc -l < "$work_dir/old-commits.txt" | tr -d ' ')

export FILTER_BRANCH_SQUELCH_WARNING=1
export MAP_FILE="$map_file"
git -C "$repo" filter-branch --force \
  --index-filter 'git ls-files -z | perl -0ne '\''chomp; print "$_\0" if m{(?:^|/)(?:\.npmrc|\.DS_Store)$|(?:^|/)(?:node_modules|dist|\.cache|\.rsbuild-cache)(?:/|$)}'\'' | git update-index --force-remove -z --stdin' \
  --commit-filter 'new_commit=$(git commit-tree "$@"); printf "%s %s\n" "$GIT_COMMIT" "$new_commit" >> "$MAP_FILE"; echo "$new_commit"' \
  -- "$branch"

git -C "$repo" rev-list "$branch" | sort > "$work_dir/new-commits.txt"
after_count=$(wc -l < "$work_dir/new-commits.txt" | tr -d ' ')
awk 'NF != 2 || $1 !~ /^[0-9a-f]{40}$/ || $2 !~ /^[0-9a-f]{40}$/ { exit 1 }' "$map_file"
awk '{ print $1 }' "$map_file" | sort > "$work_dir/mapped-old.txt"
awk '{ print $2 }' "$map_file" | sort > "$work_dir/mapped-new.txt"
map_count=$(wc -l < "$map_file" | tr -d ' ')

test "$before_count" -eq "$after_count"
test "$before_count" -eq "$map_count"
cmp "$work_dir/old-commits.txt" "$work_dir/mapped-old.txt"
cmp "$work_dir/new-commits.txt" "$work_dir/mapped-new.txt"

excluded='(?:^|/)(?:\.npmrc|\.DS_Store)$|(?:^|/)(?:node_modules|dist|\.cache|\.rsbuild-cache)(?:/|$)'
while read -r commit; do
  matches=$(git -C "$repo" ls-tree -r --name-only "$commit" | perl -ne "print if m{$excluded}")
  if test -n "$matches"; then
    echo "净化后提交 $commit 仍包含排除路径：" >&2
    printf '%s\n' "$matches" >&2
    exit 1
  fi
done < "$work_dir/new-commits.txt"

echo "history sanitized: branch=$branch commits=$after_count mappings=$map_count"
