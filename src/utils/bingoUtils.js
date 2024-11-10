export const generateBingoCard = () => {
  const card = [];
  const numbers = Array.from({ length: 75 }, (_, index) => index + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  for (let row = 0; row < 5; row++) {
    card.push(numbers.splice(0, 5));
  }
  return card;
};

export const checkCardWinCondition = (markedBalls) => {
  const isRowComplete = (row) => row.every((cell) => cell === true);
  const isColComplete = (col) => markedBalls.every((row) => row[col] === true);

  for (let i = 0; i < 5; i++) {
    if (isRowComplete(markedBalls[i]) || isColComplete(i)) return true;
  }

  const mainDiagonal = [0, 1, 2, 3, 4].every((i) => markedBalls[i][i] === true);
  const antiDiagonal = [0, 1, 2, 3, 4].every(
    (i) => markedBalls[i][4 - i] === true
  );

  return mainDiagonal || antiDiagonal;
};
