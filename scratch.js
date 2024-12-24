const a = {
    S: { S: [ 14, 12 ], H: [ 2 ], D: [], C: [] },
    W: { S: [ 9, 4 ], H: [ 4 ], D: [], C: [] },
    N: { S: [ 6, 7 ], H: [ 14 ], D: [], C: [] },
    E: { S: [ 13, 11 ], H: [ 3 ], D: [], C: [] }
};

// count all numbers in the all arrays
let count = 0;
for (const suit in a) {
    for (const rank in a[suit]) {
        count += a[suit][rank].length;
    }
}
console.log(count);