var statsController = function() {
  var controller = {
    stats: [],
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
      // Add user initials and score to stats
      self.stats.push({initials: initials, score: score});
      self.sortScoreboard();
    },

    isScoreboardWorthy: function(score) {
      var self = this;

      if (self.stats.length < self.maxStatsCount) { return true; }

      for (var i = 0; i < self.stats.length; i++) {
        if (self.stats[i].score < score) { return true; }
      }

      return false;
    },

    sortScoreboard: function() {
      var self = this;

      self.stats.sort(function(statA, statB) {
        if (statA.score < statB.score) {
          return -1;
        }
        if (statA.score > statB.score) {
          return 1;
        }

        // If score is same, alphabetize.
        if (statA.initials < statB.initials) {
          return -1;
        }
        else if (statA.initials > statB.initials) {
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