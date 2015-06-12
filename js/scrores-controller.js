var scoresController = function() {
  var controller = {
    scores: [],
    maxStatsCount: 20,

    getStats: function() {
      var self = this;
      // Ajax to read system variable
    },

    setStats: function() {
      var self = this;
      // Ajax to write system variable
    },

    addStat: function(initials, score) {
      var self = this;
      // Add user initials and score to scores array
      self.scores.push({initials: initials, score: score});
      self.sortScoreboard();
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