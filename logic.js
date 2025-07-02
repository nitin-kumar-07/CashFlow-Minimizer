window.CashflowLogic = (function () {
  function loadUserData() {
    const user = localStorage.getItem("user");
    if (!user) return [];
    try {
      const saved = JSON.parse(localStorage.getItem(`${user}_transactions`) || "[]");
      return saved;
    } catch {
      return [];
    }
  }

  function updateDashboardStats(transactions) {
    const members = new Set();
    let total = 0;
    transactions.forEach(tr => {
      members.add(tr.payer);
      members.add(tr.receiver);
      total += tr.amount;
    });
    return {
      totalTransactions: transactions.length,
      totalAmount: total,
      activeMembers: members.size
    };
  }

  function addTransaction(transactions, payer, receiver, amount) {
    const transaction = {
      payer,
      receiver,
      amount: Number(amount),
      date: new Date().toISOString(),
      id: Date.now() + Math.random()
    };
    return [...transactions, transaction];
  }

  function deleteTransaction(transactions, id) {
    return transactions.filter(t => String(t.id) !== String(id));
  }

  function cancelCycles(transactions) {
    const graph = {};

    transactions.forEach(tr => {
      if (!graph[tr.payer]) graph[tr.payer] = [];
      graph[tr.payer].push({ to: tr.receiver, amount: tr.amount, id: tr.id });
    });

    const visited = {};
    const stack = {};
    const parentMap = {};
    const cyclePath = [];
    let flag = -1;

    function dfs(node) {
      visited[node] = true;
      stack[node] = true;
      flag = 0;

      const neighbors = graph[node] || [];

      for (const edge of neighbors) {
        const neighbor = edge.to;

        if (!visited[neighbor]) {
          parentMap[neighbor] = { from: node, id: edge.id, amount: edge.amount };
          dfs(neighbor);
          if (flag === 0 && cyclePath.length > 0) return;
        } else if (stack[neighbor]) {
          flag = 0;
          let current = node;
          cyclePath.unshift({ node: neighbor, ...parentMap[node] });

          while (current !== neighbor) {
            const parent = parentMap[current];
            if (!parent) break;
            cyclePath.unshift({ node: current, ...parent });
            current = parent.from;
          }

          return;
        }
      }

      stack[node] = false;
      flag = 1;
    }

    for (const node of Object.keys(graph)) {
      if (!visited[node]) {
        flag = -1;
        dfs(node);
        if (flag === 0 && cyclePath.length > 0) break;
      }
    }

    if (flag !== 0 || cyclePath.length === 0) return transactions;

    const minAmount = Math.min(...cyclePath.map(e => e.amount));

    const updatedTransactions = transactions.map(t => {
      const edgeInCycle = cyclePath.find(e => e.id === t.id);
      if (edgeInCycle) {
        return { ...t, amount: t.amount - minAmount };
      }
      return t;
    });

    return updatedTransactions.filter(t => t.amount > 0);
  }

  function getNetBalances(transactions) {
    const balances = {};
    transactions.forEach(tr => {
      balances[tr.payer] = (balances[tr.payer] || 0) - tr.amount;
      balances[tr.receiver] = (balances[tr.receiver] || 0) + tr.amount;
    });
    return balances;
  }

  function calculateSettlement(transactions) {
    const balances = getNetBalances(transactions);
    const creditors = Object.entries(balances).filter(([_, v]) => v > 0).map(([k, v]) => [k, v]);
    const debtors = Object.entries(balances).filter(([_, v]) => v < 0).map(([k, v]) => [k, -v]);
    creditors.sort((a, b) => b[1] - a[1]);
    debtors.sort((a, b) => b[1] - a[1]);
    const settlements = [];
    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const amount = Math.min(creditors[i][1], debtors[j][1]);
      settlements.push({ from: debtors[j][0], to: creditors[i][0], amount });
      creditors[i][1] -= amount;
      debtors[j][1] -= amount;
      if (creditors[i][1] === 0) i++;
      if (debtors[j][1] === 0) j++;
    }
    return settlements;
  }

  function resetAll() {
    return [];
  }

  function loadHistory() {
    return loadUserData();
  }

  function displayHistory(transactions) {
    return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function updateHistoryStats(transactions, personName) {
    const user = localStorage.getItem("user");
    const target = personName && personName.trim() ? personName.trim().toLowerCase() : user;
    const userTransactions = transactions.filter(t =>
      t.payer.toLowerCase() === target || t.receiver.toLowerCase() === target
    );
    const totalSent = userTransactions
      .filter(t => t.payer.toLowerCase() === target)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalReceived = userTransactions
      .filter(t => t.receiver.toLowerCase() === target)
      .reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalReceived - totalSent;
    return { totalSent, totalReceived, netBalance };
  }

  function applyFilters(transactions, { filterType, fromDate, toDate, searchPerson }) {
    let filtered = [...transactions];
    const user = localStorage.getItem("user");

    if (filterType === "sent") {
      filtered = filtered.filter(t => t.payer === user);
    } else if (filterType === "received") {
      filtered = filtered.filter(t => t.receiver === user);
    }

    if (fromDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(fromDate));
    }
    if (toDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(toDate + "T23:59:59"));
    }

    if (searchPerson) {
      const searchPersonLower = searchPerson.toLowerCase();
      filtered = filtered.filter(t =>
        t.payer.toLowerCase().includes(searchPersonLower) ||
        t.receiver.toLowerCase().includes(searchPersonLower)
      );
    }

    return filtered;
  }

  return {
    loadUserData,
    updateDashboardStats,
    addTransaction,
    deleteTransaction,
    cancelCycles,
    getNetBalances,
    calculateSettlement,
    resetAll,
    loadHistory,
    displayHistory,
    updateHistoryStats,
    applyFilters
  };
})();
