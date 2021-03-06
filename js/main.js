$(function(){
    "use strict";
    function MercsManager(){
        this.$html = $('html');
        this.$moves = $('#moves');
        this.movesElems = {
            $moveInput: this.$moves.find('#move-inputs'),
            $firstInput: this.$moves.find('#move-first-input'),
            $secondInput: this.$moves.find('#move-second-input'),
            $researchInputRound: this.$moves.find('#research-move-input-round'),
            $researchInputFrom: this.$moves.find('#research-move-input-from'),
            $researchInputTo: this.$moves.find('#research-move-input-to'),
            $researchInputAdd: this.$moves.find('#research-move-input-add'),
            $researchTeams: this.$moves.find('#research-teams'),
            $researchMoveTemplate: this.$moves.find('.research-move-template'),
            $readyBtn: this.$moves.find('#ready-btn'),
            $movesShow: this.$moves.find('#moves-show'),
            $showBtn: this.$moves.find('#show-btn'),
            $movesFinal: this.$moves.find('#moves-final')
        };

        this.$resources = $('#resources');
        this.resources = {
            $editBtn: this.$resources.find('.edit-btn'),
            $autoUpkeep: this.$resources.find('#auto-upkeep'),
            $autoHoldings: this.$resources.find('#auto-holdings'),
            $resourcesVictoryPoints: this.$resources.find('#resources-victorypoints'),
            $addVPBtn: this.$resources.find('#add-vp'),
            $subtractVPBtn: this.$resources.find('#subtract-vp'),
            $resourcesMoney: this.$resources.find('#resources-money'),
            $addMoneyBtn: this.$resources.find('#add-money'),
            $subtractMoneyBtn: this.$resources.find('#subtract-money'),
            $resourcesResearch: this.$resources.find('#resources-research'),
            $addResearchBtn: this.$resources.find('#add-research'),
            $subtractResearchBtn: this.$resources.find('#subtract-research'),
            $teamCheck: this.$resources.find('#team-check'),
            $holdingsCheck: this.$resources.find('#holdings-check')
        };
        this.$team = $('#team');
        this.team = {
            $editBtn: this.$team.find('.edit-btn'),
            $playerTeam: this.$team.find('#player-team'),
            $nameField: this.$team.find('.row-add input[data-field="team-name"]'),
            $upkeepField: this.$team.find('.row-add input[data-field="team-upkeep"]'),
            $addButton: this.$team.find('.row-add a'),
            $teamDropdown: this.$team.find('#team-dropdown'),
            $specialistArea: this.$team.find('#specialist-area'),
            $specialistOptions: this.$team.find('#specialist-options'),
            $addTeam: this.$team.find('#add-team-dropdown'),
            $addTeamName: this.$team.find('#add-team-name'),
            $addTeamNameInput: this.$team.find('#add-team-name-input'),
            $addTeamBtn: this.$team.find('#add-team-dropdown-btn'),
            $addTeamErrors: this.$team.find('#add-team-errors'),
            $addTeamMinimum: this.$team.find('#add-team-minimum'),
            $minimumTeamCheck: this.$team.find('#minimum-team-check')
        };

        this.$holdings = $('#holdings');
        this.holdings = {
            $moneyField: this.$holdings.find('.row-add input[data-field="holding-money"]'),
            $researchField: this.$holdings.find('.row-add input[data-field="holding-research"]'),
            $addButton: this.$holdings.find('.row-add a')
        };

        this.savedData = JSON.parse(localStorage.getItem("mercsManagerSavedData"));

        this._init();
    }

    MercsManager.prototype = {
        _init : function(){
            this._initMoves();
            this._initResources();
            this._initTeam();
            this._initTables();

            if(this.savedData === null){
                this._createNewSave();
            } else {
                this._loadSavedData();
            }
        },
        _initMoves : function(){
            var $moves = this.$moves;

            this._initMovesInput();
            this._initMovesShow();
            this._initMovesFinal();
        },
        _initMovesInput : function(){
            var mm = this,
                movesElems = mm.movesElems;

            movesElems.$firstInput.on('input', mm._handleMoveInput);
            movesElems.$secondInput.on('input', mm._handleMoveInput);

            movesElems.$researchInputFrom.on('input', mm._handleMoveInput);
            movesElems.$researchInputTo.on('input', mm._handleMoveInput);

            movesElems.$readyBtn.on('click', $.proxy(this._submitMoveInput, this, movesElems.$firstInput, movesElems.$secondInput));
        },
        _handleMoveInput : function(){
            var $this = $(this),
                val = $this.val();

            if(val.length > 2){
                val = val.substr(0, 2);
            }

            $this.val(val.toUpperCase());
        },
        _submitMoveInput : function($firstInput, $secondInput, e){
            var movesElems = this.movesElems,
                first = $firstInput.val(),
                second = $secondInput.val();

            if(!this._areMovesValid(first, second)) {
                if(!this._isMoveValid(first)){
                    $firstInput.addClass('error');
                } else {
                    $firstInput.removeClass('error');
                }

                if(!this._isMoveValid(second)){
                    $secondInput.addClass('error');
                } else {
                    $secondInput.removeClass('error');
                }
                return;
            }

            $firstInput.removeClass('error').val('').prop('disabled', true);
            $secondInput.removeClass('error').val('').prop('disabled', true);
            this._storeResearchMoves();
            movesElems.$readyBtn.addClass('disabled');

            movesElems.$movesFinal.find('#move-first').text(first);
            movesElems.$movesFinal.find('#move-second').text(second);

            movesElems.$movesShow.addClass('in');
        },
        _areMovesValid : function(firstMove, secondMove){
            return this._isMoveValid(firstMove) && this._isMoveValid(secondMove);
        },
        _isMoveValid : function(input){
           var re = /[A-Z]\d/;
           return re.test(input);
        },
        _storeResearchMoves : function(){
            var mm = this,
                $researchMoves = this.movesElems.$researchTeams.find('tbody tr:not(.row-add, .row-template)');

            $researchMoves.each(function(i, move){
                var $this = $(this),
                    $newMove = mm.movesElems.$researchMoveTemplate.clone();

                $newMove.removeClass('research-move-template hide');
                $newMove.find('.research-from').text($this.find('.research-move-from').text());
                $newMove.find('.research-to').text($this.find('.research-move-to').text());

                $('#round-' + $this.find('.research-move-round').text()).append($newMove);
            });

            this.movesElems.$researchTeams.removeClass('in');
            $researchMoves.remove();
        },
        _initMovesShow : function(){
            var mm = this,
                movesElems = this.movesElems;

            movesElems.$showBtn.on('click', function(){
                movesElems.$showBtn.addClass('disabled');
                movesElems.$movesFinal.addClass('in');
                mm.save();
            });

        },
        _initMovesFinal : function(){
            var mm = this,
                movesElems = this.movesElems,
                $doneBtn = movesElems.$movesFinal.find('#done-btn');

            $doneBtn.on('click', function(){
                movesElems.$firstInput.prop('disabled', false);
                movesElems.$secondInput.prop('disabled', false);
                movesElems.$readyBtn.removeClass('disabled');
                movesElems.$movesFinal.find('.research-move-item:not(.row-add, .research-move-template)').remove();
                movesElems.$showBtn.removeClass('disabled');
                movesElems.$movesShow.removeClass('in');
                movesElems.$movesFinal.removeClass('in');
                mm.save();
                $("html, body").animate({ scrollTop: 0 }, 500);
            });
        },
        _initResources : function(){
            this.resources.$editBtn.on('click', $.proxy(this._toggleResourceEditMode, this));
            this.resources.$subtractVPBtn.on('click', $.proxy(this._handleAddVP, this, -1));
            this.resources.$addVPBtn.on('click', $.proxy(this._handleAddVP, this, 1));
            this.resources.$subtractMoneyBtn.on('click', $.proxy(this._handleAddMoney, this, -1));
            this.resources.$addMoneyBtn.on('click', $.proxy(this._handleAddMoney, this, 1));
            this.resources.$subtractResearchBtn.on('click', $.proxy(this._handleAddResearch, this, -1));
            this.resources.$addResearchBtn.on('click', $.proxy(this._handleAddResearch, this, 1));
            this.resources.$teamCheck.on('click', $.proxy(this._handleTeamChecked, this));
            this.resources.$holdingsCheck.on('click', $.proxy(this._handleHoldingsChecked, this));
            this.resources.$autoUpkeep.on('click', $.proxy(this._handleAutoUpkeep, this));
            this.resources.$autoHoldings.on('click', $.proxy(this._handleAutoHoldings, this));
            this.resources.$resourcesVictoryPoints.on('change', $.proxy(this._resourceChanged, this));
            this.resources.$resourcesMoney.on('change', $.proxy(this._resourceChanged, this));
            this.resources.$resourcesResearch.on('change', $.proxy(this._resourceChanged, this));
        },
        _toggleResourceEditMode : function(){
            this.resources.$editBtn.toggleClass('active');
            this.$resources.toggleClass('edit');
        },
        _handleAddVP : function(value){
            this.setVP(value);
            this.save();
        },
        _handleAddMoney : function(value){
            this.setMoney(value);
            this.save();
        },
        _handleAddResearch : function(value){
            this.setResearch(value);
            this.save();
        },
        _handleTeamChecked : function(){
            this._handleChecked(this.resources.$teamCheck, this.resources.$autoUpkeep);
        },
        _handleHoldingsChecked : function(){
            this._handleChecked(this.resources.$holdingsCheck, this.resources.$autoHoldings);
        },
        _handleChecked : function($check, $button){
            if($check.hasClass('alert-info')){ return; }
            $check.addClass('alert-success').removeClass('alert-warning');
            $button.removeClass('disabled');
        },
        _handleAutoUpkeep : function(){
            this._handleCheckAndButton(this.resources.$teamCheck, this.resources.$autoUpkeep);

            var res = this.resources,
                $soldiersUpkeep = $('tr:not(.row-template) .team-upkeep'),
                totalUpkeep = 0;

            $soldiersUpkeep.each(function(i, e){
                totalUpkeep -= parseInt($(this).text(), 10);
            });

            this.setMoney(totalUpkeep);

            this.save();
        },
        _handleAutoHoldings : function(){
            this._handleCheckAndButton(this.resources.$holdingsCheck, this.resources.$autoHoldings);

            this._addHoldingsMoney();
            this._addHoldingsResearch();
            this.save();

        },
        _addHoldingsMoney : function(){
            var res = this.resources,
                $holdingsMoney = $('tr:not(.row-template) .holding-money'),
                totalMoney = 0;

            $holdingsMoney.each(function(i, e){
                totalMoney += parseInt($(this).text(), 10);
            });

            this.setMoney(totalMoney);
        },
        _addHoldingsResearch : function(){
            var res = this.resources,
                $holdingsResearch = $('tr:not(.row-template) .holding-research'),
                totalResearch = 0;

            $holdingsResearch.each(function(i, e){
                totalResearch += parseInt($(this).text(), 10);
            });

            this.setResearch(totalResearch);
        },
        _setResource : function($resource, amount){
            var currentAmount = $resource.val();

            if(currentAmount === ""){
                $resource.val(0);
            }

            $resource.val(parseInt($resource.val(), 10) + amount);
        },
        _handleCheckAndButton : function($check, $button){
            $check.removeClass('alert-success').addClass('alert-info');
            $button.addClass('disabled');

            if(this.resources.$teamCheck.hasClass('alert-info') && this.resources.$holdingsCheck.hasClass('alert-info')){
                setTimeout($.proxy(this._resetChecks, this), 3000);
            }
        },
        _resetChecks : function(){
            this._resetCheck(this.resources.$teamCheck, this.resources.$autoUpkeep);
            this._resetCheck(this.resources.$holdingsCheck, this.resources.$autoHoldings);
        },
        _resetCheck : function($check, $button){
            $check.removeClass('alert-info').addClass('alert-warning');
            $button.addClass('disabled');
        },
        _resourceChanged : function(){
            this.resources.$resourcesVictoryPoints.val(this.resources.$resourcesVictoryPoints.val().replace(/[^\d.]/g, ""));
            this.resources.$resourcesMoney.val(this.resources.$resourcesMoney.val().replace(/[^\d.]/g, ""));
            this.resources.$resourcesResearch.val(this.resources.$resourcesResearch.val().replace(/[^\d.]/g, ""));
            this.save();
        },
        _initTeam : function(){
            this.$team.find('#sortable').sortable({items: '.team-member:not(.row-template)', axis: 'y', handle: '.handle', stop: $.proxy(this.save, this) }).disableSelection();
            this.team.$editBtn.on('click', $.proxy(this._toggleTeamEditMode, this));
            this.team.$playerTeam.on('change blur',  $.proxy(this._handleTeamSelect, this));
            this.team.$teamDropdown.on('change blur', $.proxy(this._handleTeamDropdown, this));
            this.team.$addTeamBtn.on('click', $.proxy(this._handleAddTeamDropdownBtn, this));
            this.team.$addTeamMinimum.on('click', $.proxy(this._handleAddTeamMinimumChecked, this));
            this.$html.on('click', 'a.add-kill', { mm: this },this._addKill);
            this.$html.on('click', 'a.subtract-kill', { mm: this }, this._subtractKill);
        },
        _toggleTeamEditMode : function(){
            this.team.$editBtn.toggleClass('active');
            this.$team.toggleClass('edit');
        },
        _handleTeamSelect : function(e){
            if(this.team.$playerTeam.val() === ''){ return; }

            var $specialists = this.team.$specialistOptions.find('.' + this.team.$playerTeam.val());
            this.team.$specialistArea.empty();
            this.team.$specialistArea.append($specialists);
            
            this.save();
        },
        _setTeam : function(team){
            this.team.$playerTeam.val(team);
            this.$team.addClass(team);
            this._handleTeamSelect();
        },
        _clearTeamDropdown : function(){
            this.team.$teamDropdown.val('');
            this._handleTeamDropdown();
        },
        _handleTeamDropdown : function(){
            if(this.team.$teamDropdown.val() !== ''){
                this.team.$addTeamName.val('').removeClass('hidden');
                this.team.$addTeam.removeClass('hidden').find('.unit-name').text(this.team.$teamDropdown.val());
                this.team.$addTeamMinimum.addClass('hidden');
                this.team.$minimumTeamCheck.removeClass('alert-success').addClass('alert-warning');
                this.team.$addTeamErrors.addClass('hidden');
                this.team.$addTeamBtn.removeClass('disabled');
            } else {
                this.team.$addTeam.addClass('hidden');
                this.team.$addTeamName.addClass('hidden');
            }
        },
        _handleAddTeamDropdownBtn : function(){
            var $option = this.team.$teamDropdown.find(':selected'),
                data = $option.data(),
                errors = '',
                isForMinimumArmy = this.team.$minimumTeamCheck.hasClass('alert-success');

            if(parseInt(this.resources.$resourcesResearch.val(), 10) < data.research){
                errors += '<li>Not enough research.</li>';
            }

            if(parseInt(this.resources.$resourcesMoney.val(), 10) < data.cost){
                errors += '<li>Not enough money.</li>';
            }
            
            if(errors !== '' && !isForMinimumArmy){
                this.team.$addTeamErrors.removeClass('hidden').find('ul').empty().append(errors);

                if(data.free){
                    this.team.$minimumTeamCheck.removeClass('alert-success').addClass('alert-warning');
                    this.team.$addTeamMinimum.removeClass('hidden');
                    this.team.$addTeamBtn.addClass('disabled');
                }
            } else {
                this.team.$addTeamMinimum.addClass('hidden');
                this.team.$minimumTeamCheck.removeClass('alert-success').addClass('alert-warning');

                this.team.$addTeamErrors.addClass('hidden');

                var currentMoney = parseInt(this.resources.$resourcesMoney.val(), 10),
                    currentResearch = parseInt(this.resources.$resourcesResearch.val(), 10);

                if(currentMoney <= data.cost){
                    this.resources.$resourcesMoney.val('0');
                } else {
                    this.setMoney(-data.cost);
                }

                if(currentResearch <= data.research){
                    this.resources.$resourcesResearch.val('0');
                } else {
                    this.setResearch(-data.research);
                }

                var name = this.team.$addTeamNameInput.val() === '' ? $option.val() : this.team.$addTeamNameInput.val() + ' (' + $option.val() + ')';
                this.team.$nameField.val(name);
                this.team.$upkeepField.val(data.upkeep);
                this.team.$addButton.click();
                this.save();
            }
        },
        _handleAddTeamMinimumChecked : function(){
            this._handleChecked(this.team.$minimumTeamCheck, this.team.$addTeamBtn);
        },
        _addKill : function(e){
            var $btn = $(e.currentTarget),
                $row = $btn.parents('tr'),
                $killCount = $row.find('.kill-count');

            $killCount.text(parseInt($killCount.text(), 10) + 1);

            e.data.mm.save();
        },
        _subtractKill : function(e){
            var $btn = $(e.currentTarget),
                $row = $btn.parents('tr'),
                $killCount = $row.find('.kill-count');

            $killCount.text(parseInt($killCount.text(), 10) - 1);

            e.data.mm.save();
        },
        _initTables : function(){
            this.$html.on('click', '.row-add .btn', { mm: this }, this._addRow);
            this.$html.on('click', 'a.row-remove', { mm: this }, this._removeRow);
        },
        _addRow : function(e){
            var mm = e.data.mm,
                $btn = $(e.currentTarget),
                $table = $btn.parents('tbody'),
                $addRow = $table.find('.row-add'),
                $template = $table.find('.row-template'),
                $newRow = $template.clone(),
                isValid = true;

            $addRow.find('[data-field]').each(function(i, e){
                var $this = $(this),
                    field = $this.data('field');

                if(typeof $this.attr('data-validate') !== 'undefined'){
                    var validateType = $this.attr('data-validate');

                    if(validateType === 'round'){
                        if(!mm._isRoundValid($this.val())){
                            $this.addClass('error');
                            isValid = false;
                            return false;
                        }
                    } else if(validateType === 'move'){
                        if(!mm._isMoveValid($this.val())){
                            $this.addClass('error');
                            isValid = false;
                            return false;
                        }
                    } else if (validateType === 'number'){
                        if(!mm._isNumber($this.val())){
                            $this.addClass('error');
                            isValid = false;
                            return false;
                        }
                    }
                }

                $this.removeClass('error');

                $newRow.find('.' + field).text($this.val());
            });

            if(!isValid){ return; } 

            $template.attr('data-index', parseInt($template.attr('data-index'), 10) + 1);

            $newRow.removeClass('row-template hide').insertBefore($addRow);

            mm.save();

            return true;
        },
        _isRoundValid : function(input){
           var re = /^[1-2]$/;
           return re.test(input);
        },
        _isNumber : function(input){
            var re = /[0-9]/;
           return re.test(input);
        },
        _removeRow : function(e){
            var $btn = $(e.currentTarget),
                $row = $btn.parents('tr');

            $row.remove();

            e.data.mm.save();
        },
        _createNewSave : function(){
            this.savedData = {
                money: 0,
                research: 0,
                vp: 0,
                playerTeam: '',
                team: [],
                holdings: [],
                hasMoves: false,
                moves: []
            };

            this.save();
        },
        _getTeamMembers : function(){
            var $teamMembers = $('.team-member:not(.row-template)'),
                team = [];

            $teamMembers.each(function(i, e){
                var $this = $(this),
                    member = {
                        name: $this.find('.team-name').text(),
                        kills: $this.find('.kill-count').text(),
                        upkeep: $this.find('.team-upkeep').text()
                    };

                team.push(member);
            });

            return team;
        },
        _getHoldings : function(){
            var $holdings = $('.holding:not(.row-template)'),
                holdings = [];

            $holdings.each(function(i, e){
                var $this = $(this),
                    holding = {
                        money: $this.find('.holding-money').text(),
                        research: $this.find('.holding-research').text()
                    };

                holdings.push(holding);
            });

            return holdings;
        },
        _getMoves : function(){
            return {
                army1: $('#move-first').text(),
                research1: this._getResearchMoves(1),
                army2: $('#move-second').text(),
                research2: this._getResearchMoves(2)
            };
        },
        _getResearchMoves : function(round){
            var roundResearch = [];

            $('#round-' + round + ' .research-move-item').each(function(i, m){
                var $this = $(this),
                    move = [$this.find('.research-from').text(), $this.find('.research-to').text()];

                roundResearch.push(move);
            });

            return roundResearch;
        },
        _loadSavedData : function(){
            var mm = this,
                save = this.savedData;

            this.resources.$resourcesVictoryPoints.val(save.vp);
            this.resources.$resourcesMoney.val(save.money);
            this.resources.$resourcesResearch.val(save.research);

            this._setTeam(save.playerTeam);

            $.each(save.team, function(i, member){
                mm.team.$nameField.val(member.name);
                mm.team.$upkeepField.val(member.upkeep);
                mm.team.$addButton.click();
                mm.$team.find('[data-index="' + i + '"] .kill-count').text(member.kills);
            });

            $.each(save.holdings, function(i, holding){
                mm.holdings.$moneyField.val(holding.money);
                mm.holdings.$researchField.val(holding.research);
                mm.holdings.$addButton.click();
            });

            if(save.hasMoves){
                this.movesElems.$firstInput.val(save.moves.army1);
                this.movesElems.$secondInput.val(save.moves.army2);

                mm._addResearchMovesFromSave(save.moves.research1, 1);
                mm._addResearchMovesFromSave(save.moves.research2, 2);

                mm._submitMoveInput(mm.movesElems.$firstInput, mm.movesElems.$secondInput);
                mm.movesElems.$showBtn.click();
            }
        },
        _addResearchMovesFromSave : function(researchArray, round){
            var mm = this;

            $.each(researchArray, function(i, m){
                mm.movesElems.$researchInputRound.val(round);
                mm.movesElems.$researchInputFrom.val(m[0]);
                mm.movesElems.$researchInputTo.val(m[1]);
                mm.movesElems.$researchInputAdd.click();
            });
        },
        setVP : function(amount){
            this._setResource(this.resources.$resourcesVictoryPoints, amount);
        },
        setMoney : function(amount){
            this._setResource(this.resources.$resourcesMoney, amount);
        },
        setResearch : function(amount){
            this._setResource(this.resources.$resourcesResearch, amount);
        },
        save : function(){
            this.savedData = {
                vp: parseInt(this.resources.$resourcesVictoryPoints.val(), 10),
                money: parseInt(this.resources.$resourcesMoney.val(), 10),
                research: parseInt(this.resources.$resourcesResearch.val(), 10),
                playerTeam: this.team.$playerTeam.val(),
                team: this._getTeamMembers(),
                holdings: this._getHoldings(),
                hasMoves: this.movesElems.$movesFinal.hasClass('in')
            };

            if(this.savedData.hasMoves){
                this.savedData.moves = this._getMoves();
            } else {
                this.savedData.moves = {};
            }

            localStorage.setItem("mercsManagerSavedData", JSON.stringify(this.savedData));
        }
    };

    window.mm = new MercsManager();
});