var expect = chai.expect;

chai.config.truncateThreshold = 0;  // disable truncating

describe('dds', function() {
  it('should solve mid-trick', function() {
    var result = nextPlays('N:T843.K4.KT853.73 J97.J763.642.KJ5 Q52.Q982.QJ.9862 AK6.AT5.A97.AQT4', 'N', 'W', ['5D', '2D', 'QD'])
    expect(result).to.deep.equal({
      player: 'W',
      tricks: { ns: 0, ew: 0 },
      plays: [
        { suit: 'D', rank: '7', equals: [], score: 9 },
        { suit: 'D', rank: '9', equals: [], score: 9 },
        { suit: 'D', rank: 'A', equals: [], score: 8 }
      ]
    });
  });
});

describe('Board', function() {
  it('should play a card', function() {
    var b = new Board('N:T843.K4.KT853.73 J97.J763.642.KJ5 Q52.Q982.QJ.9862 AK6.AT5.A97.AQT4', 'W', 'N');
    expect(b.ew_tricks).to.equal(0);
    expect(b.ns_tricks).to.equal(0);
    expect(b.declarer).to.equal('W');
    expect(b.strain).to.equal('N');
    expect(b.tricks).to.be.empty;

    expect(b.cardsForPlayer('W')).to.deep.equal([
      {suit: 'S', rank: 14},
      {suit: 'S', rank: 13},
      {suit: 'S', rank: 6},
      {suit: 'H', rank: 14},
      {suit: 'H', rank: 10},
      {suit: 'H', rank: 5},
      {suit: 'D', rank: 14},
      {suit: 'D', rank: 9},
      {suit: 'D', rank: 7},
      {suit: 'C', rank: 14},
      {suit: 'C', rank: 12},
      {suit: 'C', rank: 10},
      {suit: 'C', rank: 4}
    ]);

    expect(b.cards.W.S).to.deep.equal([14, 13, 6]);  // AK6

    expect(b.cards.N.D).to.deep.equal([13, 10, 8, 5, 3]);  // KT853
    b.play('N', 'D', 5);
    expect(b.cards.N.D).to.deep.equal([13, 10, 8, 3]);  // KT83
    expect(b.plays).to.deep.equal([{player: 'N', suit: 'D', rank: 5}]);
    expect(b.player).to.equal('E');
  });

  it('should play a trick', function() {
    var b = new Board('N:T843.K4.KT853.73 J97.J763.642.KJ5 Q52.Q982.QJ.9862 AK6.AT5.A97.AQT4', 'W', 'N');
    b.play('N', 'D', 5);
    b.play('E', 'D', 2);
    b.play('S', 'D', 12);
    b.play('W', 'D', 9);

    expect(b.ew_tricks).to.equal(0);
    expect(b.ns_tricks).to.equal(1);
    expect(b.plays).to.be.empty;
    expect(b.tricks).to.deep.equal([
      {
        leader: 'N',
        winner: 'S',
        plays: [
          {player: 'N', suit: 'D', rank: 5},
          {player: 'E', suit: 'D', rank: 2},
          {player: 'S', suit: 'D', rank: 12},
          {player: 'W', suit: 'D', rank: 9}
        ]
      }
    ]);
    expect(b.player).to.equal('S');
  });

  it('should determine legal plays', function() {
    var b = new Board('N:T843.K4.KT853.73 J97.J763.642.KJ5 Q52.Q982.QJ.9862 AK6.AT5.A97.AQT4', 'W', 'N');
    b.play('N', 'D', 5);

    expect(b.legalPlays()).to.deep.equal([
      {player: 'E', suit: 'D', rank: 6},
      {player: 'E', suit: 'D', rank: 4},
      {player: 'E', suit: 'D', rank: 2}
    ]);
    b.play('E', 'D', 2);
    expect(b.legalPlays()).to.deep.equal([
      {player: 'S', suit: 'D', rank: 12},
      {player: 'S', suit: 'D', rank: 11}
    ]);

    b.play('S', 'D', 12);
    b.play('W', 'D', 9);
    expect(b.legalPlays()).to.have.length(12);
  });

  it('should throw on illegal plays', function() {
    var b = new Board('N:T843.K4.KT853.73 J97.J763.642.KJ5 Q52.Q982.QJ.9862 AK6.AT5.A97.AQT4', 'W', 'N');
    b.play('N', 'D', 5);
    expect(() => {
      b.play('E', 'C', 5);
    }).to.throw(/follow suit/);
  });
});