function generateNumber() {
    let digits = [];
    while (digits.length < 4) {
        let randomDigit = Math.floor(Math.random() * 9) + 1;

        if (digits.filter(digit => digit === randomDigit).length < 2) {
            digits.push(randomDigit);
        }
    }
    document.getElementById("result").innerText = digits.join('');
}