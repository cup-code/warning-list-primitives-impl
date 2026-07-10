<script>
export default {}
</script>

<template>
  <div class="page-container">
    <ECard slot="search" type="search" />

    <ECard slot="table">
      <div class="card-cell" />
      <CTable :columns="columns" :data="data" />
    </ECard>

    <ECard slot="page" type="footer" />
  </div>
</template>

<style>
.page-container {
  display: flex;
}
</style>
