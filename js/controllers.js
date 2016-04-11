// TODO: ADD COMMENTS TO THIS MONSTROSITY

var nbaLineupApp = angular.module('nbaLineupApp', ['ngSanitize', 'ui.select', 'ui.bootstrap', 'ngRoute']);

// Service to format results from NBA API results 
// are returned as an Object with a list of headers
// and a list of lists, where the values at each index 
// are keyed to the header at the same index
// 
// generateListOfObjects:
// Use underscore JS to return this as a list of objects
// with the right key-value pairs.
//
nbaLineupApp.service('formatAPIResults', function() {
    var formattingService = {
        generateListOfObjects: function(headers, list) {
            return _.map(list, function(listInList) {
                return _.object(headers, listInList)
            })
        },

        addNameKeys: function(eligiblePlayerObjects) {
            eligiblePlayerObjects = _.map(eligiblePlayerObjects, function(playerObject) {
                var nameComponents = playerObject.DISPLAY_LAST_COMMA_FIRST.split(", ");
                try {
                    playerObject.firstName = nameComponents[1].toLowerCase();
                    playerObject.lastName = nameComponents[0].toLowerCase();
                    playerObject.fullName = playerObject.firstName + ' ' + playerObject.lastName;
                }
                catch(err) {
                    // fuck you Nene
                    playerObject.firstName = nameComponents[0].toLowerCase();
                    playerObject.lastName = '';
                    playerObject.fullName = playerObject.firstName;
                }
                
                return playerObject;
            })

            return eligiblePlayerObjects;
        },

        settingsToQueryParams: function(paramName, settingsObject, queryParams) {
            var settingsObjectAsListOfPairs = _.pairs(settingsObject);
            var filterTrueSettings = _.filter(settingsObjectAsListOfPairs, function(pair) { return pair[1]; })
            var listQueryParamValues = _.map(filterTrueSettings, _.first);
            queryParams[paramName] = listQueryParamValues;
            return queryParams;
        }

    };
    return formattingService;
})

nbaLineupApp.factory('teamData', function() {
    var teamData = {};
    teamData['teams'] = [{'lineups': [], 'roster': []},{'lineups': [], 'roster':[]}];

    teamData.addTeamLineups = function(team_num, lineups) {
        teamData.teams[team_num].lineups = lineups;
    }
    teamData.addTeamRoster = function(team_num, roster) {
        teamData.teams[team_num].roster = roster;
    }

    return teamData;
})

nbaLineupApp.service('nbaAPI', function($http, formatAPIResults){
    
    var getterService = {

        getAllTeams: function() {
            return([
                {
                    id: "1610612737",
                    teamName: "Atlanta Hawks",
                    abbrev: "ATL"
                }, {
                    id: "1610612738",
                    teamName: "Boston Celtics",
                    abbrev: "BOS"
                }, {
                    id: "1610612751",
                    teamName: "Brooklyn Nets",
                    abbrev: "BRK"
                }, {
                    id: "1610612766",
                    teamName: "Charlotte Hornets",
                    abbrev: "CHA"
                }, {
                    id: "1610612741",
                    teamName: "Chicago Bulls",
                    abbrev: "CHI"
                }, {
                    id: "1610612739",
                    teamName: "Cleveland Cavaliers",
                    abbrev: "CLE"
                }, {
                    id: "1610612742",
                    teamName: "Dallas Mavericks",
                    abbrev: "DAL"
                }, {
                    id: "1610612743",
                    teamName: "Denver Nuggets",
                    abbrev: "DEN"
                }, {
                    id: "1610612765",
                    teamName: "Detroit Pistons",
                    abbrev: "DET"
                }, {
                    id: "1610612744",
                    teamName: "Golden State Warriors",
                    abbrev: "GSW"
                }, {
                    id: "1610612745",
                    teamName: "Houston Rockets",
                    abbrev: "HOU"
                }, {
                    id: "1610612754",
                    teamName: "Indiana Pacers",
                    abbrev: "IND"
                }, {
                    id: "1610612746",
                    teamName: "Los Angeles Clippers",
                    abbrev: "LAC"
                }, {
                    id: "1610612747",
                    teamName: "Los Angeles Lakers",
                    abbrev: "LAL"
                }, {
                    id: "1610612763",
                    teamName: "Memphis Grizzlies",
                    abbrev: "MEM"
                }, {
                    id: "1610612748",
                    teamName: "Miami Heat",
                    abbrev: "MIA"
                }, {
                    id: "1610612749",
                    teamName: "Milwaukee Bucks",
                    abbrev: "MIL"
                }, {
                    id: "1610612750",
                    teamName: "Minnesota Timberwolves",
                    abbrev: "MIN"
                }, {
                    id: "1610612740",
                    teamName: "New Orleans Pelicans",
                    abbrev: "NOP"
                }, {
                    id: "1610612752",
                    teamName: "New York Knicks",
                    abbrev: "NYK"
                }, {
                    id: "1610612760",
                    teamName: "Oklahoma City Thunder",
                    abbrev: "OKC"
                }, {
                    id: "1610612753",
                    teamName: "Orlando Magic",
                    abbrev: "ORL"
                }, {
                    id: "1610612755",
                    teamName: "Philadelphia 76ers",
                    abbrev: "PHI"
                }, {
                    id: "1610612756",
                    teamName: "Phoenix Suns",
                    abbrev: "PHX"
                }, {
                    id: "1610612757",
                    teamName: "Portland Trail Blazers",
                    abbrev: "POR"
                }, {
                    id: "1610612758",
                    teamName: "Sacramento Kings",
                    abbrev: "SAC"
                }, {
                    id: "1610612759",
                    teamName: "San Antonio Spurs",
                    abbrev: "SAS"
                }, {
                    id: "1610612761",
                    teamName: "Toronto Raptors",
                    abbrev: "TOR"
                }, {
                    id: "1610612762",
                    teamName: "Utah Jazz",
                    abbrev: "UTA"
                }, {
                    id: "1610612764",
                    teamName: "Washington Wizards",
                    abbrev: "WAS"
                }
            ])
            
        },

        getLineups:function(teamID, season, seasonType) {
            var teamLineupsUrl = "http://stats.nba.com/stats/teamdashlineups"
            var requiredParams = {
                "DateFrom": "",
                "DateTo": "",
                "GameID": "",
                "GameSegment":"",
                "GroupQuantity":"5",
                "LastNGames":"0",
                "LeagueID":"00",
                "Location":"",
                "MeasureType":"Base",
                "Month":"0",
                "OpponentTeamID":"0",
                "Outcome":"",
                "PaceAdjust":"N",
                "PerMode":"Totals",
                "Period":"0",
                "PlusMinus":"N",
                "Rank":"N",
                "SeasonSegment":"",
                "TeamID":teamID,
                "VsConference":"",
                "VsDivision":"",
                "Season": season,
                "SeasonType": seasonType,
                "callback":"JSON_CALLBACK"
                

            }
            var promise = $http.jsonp(teamLineupsUrl, { "params": requiredParams}).then(function(response) {
                var headers = response.data.resultSets[1].headers;
                var lineups = response.data.resultSets[1].rowSet;
                var lineupObjects = formatAPIResults.generateListOfObjects(headers, lineups);
                return lineupObjects;
            });
            return promise;

        },

        getRoster: function(teamID,season, seasonType) {
            var rosterUrl = "http://stats.nba.com/stats/teamplayerdashboard"
            var requiredParams = {  
              "MeasureType":"Base",
              "PerMode":"PerGame",
              "PlusMinus":"N",
              "PaceAdjust":"N",
              "Rank":"N",
              "LeagueID":"00",
              "Season":season,
              "SeasonType":seasonType,
              "PORound":"",
              "TeamID":teamID,
              "Outcome":"",
              "Location":"",
              "Month":"0",
              "SeasonSegment":"",
              "DateFrom":"",
              "DateTo":"",
              "OpponentTeamID":"0",
              "VsConference":"",
              "VsDivision":"",
              "GameSegment":"",
              "Period":"0",
              "ShotClockRange":"",
              "LastNGames":"0",
              "callback":"JSON_CALLBACK"
           } 
           var promise = $http.jsonp(rosterUrl, { "params": requiredParams}).then(function(response) {
                var headers = response.data.resultSets[1].headers;
                var players = response.data.resultSets[1].rowSet;
                var playerObjects = formatAPIResults.generateListOfObjects(headers, players);
                return playerObjects;
            });
            return promise;
        },

        getGameLogForPlayer: function(playerID, season, seasonType) {
            var gameLogForPlayerUrl = "http://stats.nba.com/stats/playergamelog"
            var requiredParams ={  
                "PlayerID": playerID,
                "LeagueID":"00",
                "Season":season,
                "SeasonType":seasonType,
                "callback":"JSON_CALLBACK"
            }
            var promise = $http.jsonp(gameLogForPlayerUrl, { "params": requiredParams}).then(function(response) {
                var headers = response.data.resultSets[0].headers;
                var games = response.data.resultSets[0].rowSet;
                var playerObjects = formatAPIResults.generateListOfObjects(headers, games);
                return playerObjects;
            });
            return promise;
        },

        getGamePlayByPlay: function(gameID) {
            var gamePlayByPlayUrl = "http://stats.nba.com/stats/playbyplayv2?EndPeriod=10" + 
            "&EndRange=55800&RangeType=2&Season=2014-15&SeasonType=Regular+Season" +
            "&StartPeriod=1&StartRange=0&callback=JSON_CALLBACK&GameID=" + gameID;

            var promise = $http.jsonp(gamePlayByPlayUrl).then(function(response) {
                var headers = response.data.resultSets[0].headers;
                var playList = response.data.resultSets[0].rowSet;
                var playObjects = formatAPIResults.generateListOfObjects(headers, playList);

                return playObjects;
            })
            return promise;
        }
       
    };
    return getterService;
});

nbaLineupApp.controller('teamController', function ($scope, nbaAPI, $modal, $routeParams, teamData) {
    scope = $scope;

    // clear all outward facing variables
    $scope.clear = function() {
        
    };

    //initialize
    $scope.clear();
    $scope.teams = nbaAPI.getAllTeams();
    $scope.searchTeams = $scope.teams;
    $scope.teamOne = {};
    $scope.teamTwo = {};
    $scope.selectedSeason = "2015-16";
    $scope.selectedSeasonType = "Regular Season";
    $scope.seasons = ["2014-15", "2015-16"];
    $scope.seasonTypes = ["Regular Season", "Playoffs"];

    
    
    $scope.refreshTeams = function(teamSearch) {
        if (teamSearch) {
            teamSearch = teamSearch.toLowerCase();
             $scope.searchTeams = _.filter($scope.searchTeams, function(teamObject) {
                return (teamObject.teamName.toLowerCase().indexOf(teamSearch) > -1 ||
                       teamObject.abbrev.toLowerCase().indexOf(teamSearch) > -1 )
            })
        }
        else $scope.searchTeams = $scope.teams;
       
    };

    $scope.$watch('teamOne.selected', function(val) {
        if (val) {
            $scope.teamOneInit = false;
            $scope.searchTeams = $scope.teams;
            $scope.mostPlayedLineups(val.id, function(result) {
                teamData.addTeamLineups(0, result.slice(0,3));
                $scope.getRoster(val.id, function(result) {
                    teamData.addTeamRoster(0, result);
                    $scope.teamOneInit = true;
                })
            })
        }
    })

     $scope.$watch('teamTwo.selected', function(val) {
        if (val) {
            $scope.teamTwoInit = false;
            $scope.searchTeams = $scope.teams;
            $scope.mostPlayedLineups(val.id, function(result) {
                teamData.addTeamLineups(1, result.slice(0,3));
                $scope.getRoster(val.id, function(result) {
                    teamData.addTeamRoster(1, result);
                    $scope.teamTwoInit = true;
                })
            })
        }
    })

    $scope.mostPlayedLineups = function(teamID, callback) {
        nbaAPI.getLineups(teamID, $scope.selectedSeason, $scope.selectedSeasonType).then(function(result) {
            callback(result);
        })
    };


   $scope.getRoster = function(teamID, callback) {
        nbaAPI.getRoster(teamID, $scope.selectedSeason, $scope.selectedSeasonType).then(function(result) {
             callback(result);
        })
    };
});

nbaLineupApp.controller('lineupController', function ($scope, nbaAPI, $modal, $routeParams, teamData) {
    scope_lineup = $scope;
    $scope.teamData = teamData;
    $scope.teamOneLineups = [];
    $scope.teamTwoLineups = [];
    $scope.selectedLineups = {};
    $scope.allGames = [];
    // depends on roster
    var formatLineups = function(uf_lineups, roster) {
        return _.map(uf_lineups, function(uf_lineup) {
            return _.map(uf_lineup.GROUP_ID.split(" - "), function(playerID) {
                return _.findWhere(roster, {"PLAYER_ID": parseInt(playerID)})
            })
        })
    }

    $scope.availableRoster = function(teamIndex, lineup) {
        if (teamIndex == 0) {
            return _.difference($scope.teamOneRoster, lineup);
        }
            
        else {
            return _.difference($scope.teamTwoRoster, lineup);
        }
    }

    $scope.$watchCollection('teamData.teams[0].roster', function(newVal) {
        $scope.teamOneRoster = newVal;
        $scope.teamOneLineups = formatLineups($scope.teamData.teams[0].lineups,newVal)
    })

    $scope.$watchCollection('teamData.teams[1].roster', function(newVal) {
        $scope.teamTwoRoster = newVal;
        $scope.teamTwoLineups = formatLineups($scope.teamData.teams[1].lineups,newVal)
    })

    var getIDsFromGameLog = function(player, callback) {
        var playerLogs = nbaAPI.getGameLogForPlayer(player.PLAYER_ID, $scope.selectedSeason, $scope.selectedSeasonType).then(function(result) {
            var tempGameIDs = _.pluck(result, "Game_ID");
            if ($scope.gameIDs.length == 0) {
                $scope.gameIDs = tempGameIDs;
                callback();
                if (tempGameIDs.length == 0) return 
            }
            else{
                $scope.gameIDs = _.intersection($scope.gameIDs, tempGameIDs);
                callback()

            }                 

        })
    }

    var func = function() {
        $scope.allGames = _.union($scope.allGames, $scope.gameIDs)
    }
    $scope.explore = function() {
        var consolidateGames = _.after(10, func);
        $scope.gameIDs = [];
        $scope.matchupGames = [];
        _.map($scope.selectedLineups.teamOne, function(player) {
            getIDsFromGameLog(player, consolidateGames);
        })
        _.map($scope.selectedLineups.teamTwo, function(player) {
            getIDsFromGameLog(player, consolidateGames);
        }) 
    }

});
    