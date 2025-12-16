// Global state to store the current numbers
let currentNumbers = [];

function generateNumber() {
  let digits = [];
  while (digits.length < 4) {
    let randomDigit = Math.floor(Math.random() * 9) + 1;

    // Keep the rule: max 2 duplicates of same number
    if (digits.filter((digit) => digit === randomDigit).length < 2) {
      digits.push(randomDigit);
    }
  }

  currentNumbers = digits;
  renderCards(digits);
  resetSolverUI();
}

function renderCards(numbers) {
  const container = document.getElementById("cards-container");
  container.innerHTML = "";

  numbers.forEach((num, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerText = num;
    // Smooth rolling animation with "pro" easing (cubic-bezier)
    // cubic-bezier(0.34, 1.56, 0.64, 1) gives a nice overshoot/snap effect
    card.style.animation = `rollIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.15}s forwards`;
    container.appendChild(card);
  });
}

function resetSolverUI() {
  const resultDiv = document.getElementById("result");
  const solveBtn = document.getElementById("solve-btn");

  resultDiv.innerHTML = "Ready to solve?";
  resultDiv.className = "solution-content";
  solveBtn.disabled = false;
}

function showAnswer() {
  const resultDiv = document.getElementById("result");
  const solveBtn = document.getElementById("solve-btn");

  solveBtn.disabled = true;
  resultDiv.innerHTML = "Calculating...";

  // weird tiny delay to allow UI to update if it were heavy calculation (it's not really needed here but good practice)
  setTimeout(() => {
    const solution = solve24(currentNumbers);

    if (solution) {
      resultDiv.innerHTML = `Solution found:<br>${solution} = 24`;
      resultDiv.className = "solution-content solution-success";
    } else {
      resultDiv.innerHTML = "No solution found for these numbers.";
      resultDiv.className = "solution-content solution-fail";
    }
  }, 100);
}

// --- Solver Logic ---

function solve24(nums) {
  const target = 24;
  const epsilon = 0.000001; // For float comparison

  const ops = [
    { sym: '+', func: (a, b) => a + b },
    { sym: '-', func: (a, b) => a - b },
    { sym: '*', func: (a, b) => a * b },
    { sym: '/', func: (a, b) => b === 0 ? null : a / b } // Handle division by zero
  ];

  // Helper to get all permutations
  function getPermutations(arr) {
    if (arr.length <= 1) return [arr];
    let result = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
      const remainingPerms = getPermutations(remaining);
      for (let perm of remainingPerms) {
        result.push([current, ...perm]);
      }
    }
    return result;
  }

  const perms = getPermutations(nums);

  // Parentheses patterns for 4 numbers (a, b, c, d)
  // 1: ((a op b) op c) op d
  // 2: (a op (b op c)) op d
  // 3: (a op b) op (c op d)
  // 4: a op ((b op c) op d)
  // 5: a op (b op (c op d))

  for (let p of perms) {
    const [a, b, c, d] = p;

    for (let op1 of ops) {
      for (let op2 of ops) {
        for (let op3 of ops) {

          // Pattern 1: ((a op1 b) op2 c) op3 d
          try {
            let res1 = op1.func(a, b);
            if (res1 !== null) {
              let res2 = op2.func(res1, c);
              if (res2 !== null) {
                let res3 = op3.func(res2, d);
                if (res3 !== null && Math.abs(res3 - target) < epsilon) {
                  return `((${a} ${op1.sym} ${b}) ${op2.sym} ${c}) ${op3.sym} ${d}`;
                }
              }
            }
          } catch (e) { }

          // Pattern 2: (a op1 (b op2 c)) op3 d
          try {
            let res1 = op2.func(b, c);
            if (res1 !== null) {
              let res2 = op1.func(a, res1);
              if (res2 !== null) {
                let res3 = op3.func(res2, d);
                if (res3 !== null && Math.abs(res3 - target) < epsilon) {
                  return `(${a} ${op1.sym} (${b} ${op2.sym} ${c})) ${op3.sym} ${d}`;
                }
              }
            }
          } catch (e) { }

          // Pattern 3: (a op1 b) op2 (c op3 d)
          try {
            let res1 = op1.func(a, b);
            let res2 = op3.func(c, d);
            if (res1 !== null && res2 !== null) {
              let res3 = op2.func(res1, res2);
              if (res3 !== null && Math.abs(res3 - target) < epsilon) {
                return `(${a} ${op1.sym} ${b}) ${op2.sym} (${c} ${op3.sym} ${d})`;
              }
            }
          } catch (e) { }

          // Pattern 4: a op1 ((b op2 c) op3 d)
          try {
            let res1 = op2.func(b, c);
            if (res1 !== null) {
              let res2 = op3.func(res1, d);
              if (res2 !== null) {
                let res3 = op1.func(a, res2);
                if (res3 !== null && Math.abs(res3 - target) < epsilon) {
                  return `${a} ${op1.sym} ((${b} ${op2.sym} ${c}) ${op3.sym} ${d})`;
                }
              }
            }
          } catch (e) { }

          // Pattern 5: a op1 (b op2 (c op3 d))
          try {
            let res1 = op3.func(c, d);
            if (res1 !== null) {
              let res2 = op2.func(b, res1);
              if (res2 !== null) {
                let res3 = op1.func(a, res2);
                if (res3 !== null && Math.abs(res3 - target) < epsilon) {
                  return `${a} ${op1.sym} (${b} ${op2.sym} (${c} ${op3.sym} ${d}))`;
                }
              }
            }
          } catch (e) { }

        }
      }
    }
  }

  return null;
}

// Initialize with a set of numbers on load
window.onload = generateNumber;
