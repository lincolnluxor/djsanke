var scoresController = function() {
  var controller = {
    scores: [],
    maxStatsCount: 20,

    init: function() {
      var self = this;
      self.getStats();
    },

    getStats: function() {
      var self = this;
      // @todo: Make Ajax call to read stored scores from server

      var cookieScores = JSON.parse(cookies.get('djsanke-scores'));
      if (cookieScores instanceof Array) { self.scores = cookieScores; }
    },

    setStats: function() {
      var self = this;
      // @todo: Make Ajax call to write stored scores to server

      cookies.set('djsanke-scores', JSON.stringify(self.scores), {expires: new Date(2025, 1, 1)});
    },

    addStat: function(initials, score) {
      var self = this;
      // Add user initials and score to scores array
      self.scores.push({initials: initials, score: score});
      self.sortScoreboard();
      self.setStats();
    },

    isScoreboardWorthy: function(score) {
      var self = this;

      if (self.scores.length < self.maxStatsCount) { return true; }

      for (var i = 0; i < self.scores.length; i++) {
        if (self.scores[i].score < score) { return true; }
      }

      return false;
    },

    sortScoreboard: function() {
      var self = this;

      self.scores.sort(function(scoreA, scoreB) {
        if (scoreA.score < scoreB.score) {
          return -1;
        }
        if (scoreA.score > scoreB.score) {
          return 1;
        }

        // If score is same, alphabetize.
        if (scoreA.initials < scoreB.initials) {
          return -1;
        }
        else if (scoreA.initials > scoreB.initials) {
          return 1;
        }

        // a must be equal to b
        return 0;
      });
    }
  };

  controller.init();
  return controller;
};