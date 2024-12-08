<script lang="ts">
  type Props = {
    tabs: Array<{
      id: number;
      title: string;
    }>;
    currentTab?: any;
    getCurrentTabValue?: (v: string)=> void;
  };
  let { tabs, currentTab, getCurrentTabValue }: Props = $props();

  let activeTab = $state(currentTab);

  const updateTab = (selectedTab: any) => {
    activeTab = selectedTab.title;
    currentTab = selectedTab.title;
    getCurrentTabValue && getCurrentTabValue(selectedTab.title);
  };
</script>

<div class="tabs">
  <div class="tab-headers">
    {#each tabs as tab}
      <button
        class="tab-header {activeTab === tab.title ? 'active' : ''}"
        onclick={() => updateTab(tab)}
      >
        {tab.title}
      </button>
    {/each}
  </div>
</div>

<style>
  .tabs {
    display: flex;
    flex-direction: column;
  }

  .tab-headers {
    display: flex;
    padding: 5px;
    background-color: #fff;
    border-radius: 10px;
  }

  .tab-header {
    flex: 1;
    padding: 10px;
    text-align: center;
    cursor: pointer;
    border: none;
    color: #909397;
    background-color: transparent;
    transition:
      border-color 0.3s,
      color 0.3s;
  }

  .tab-header.active {
    background-color: #e4e2e2;
    color: #172838;
    border-radius: 5px;
  }

  .tab-header:hover {
    color: #172838;
  }

  @media (max-width: 400px) {
    .tab-header {
      padding: 8px 5px;
      font-size: 14px;
    }
  }
</style>
