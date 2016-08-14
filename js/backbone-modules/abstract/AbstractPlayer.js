/*
 * dependencies: jquery, backbonejs, underscorejs
 */
(function() {
	"use strict";
	var $ = window.jQuery,
		_ = window._;
	$.extend(true, window.sliMpd, {
		modules : {}
	});
	window.sliMpd.modules.AbstractPlayer = window.sliMpd.modules.AbstractView.extend({

		name : null,
		rendered : false,
		mode : "",

		nowPlayingPercent : 0,
		nowPlayingState : "pause",
		nowPlayingDuration : 0,
		nowPlayingElapsed : 0,
		nowPlayingItem : "",
		previousPlayingItem : "",

		state : {
			repeat : 0,
			random : 0,
			consume : 0
		},

		faviconDoghnutColor : "#000000",
		faviconBackgroundColor : "transparent",

		timeGridSelectorCanvas : "",
		timeGridSelectorSeekbar : "",
		timeGridStrokeColor : "",
		timeGridStrokeColor2 : "",

		showWaveform : true,

		intervalActive : 2000, // [ms]
		intervalInactive : 5000, // [ms]

		waveformSettings : { },

		initialize(options) {
			this.render();
			window.sliMpd.modules.AbstractView.prototype.initialize.call(this, options);
		},

		render(renderMarkup) {
			if (this.rendered) {
				return;
			}

			if (renderMarkup) {
				this.$el.html($(this._template((this.model || {}).attributes)));
			}

			window.sliMpd.modules.AbstractView.prototype.render.call(this);

			this.rendered = true;
		},

		// fetch markup with trackinfos
		redraw(item) {
			item = item || { item : 0};
			var url = sliMpd.conf.absRefPrefix + "markup/"+ this.mode+"player";
			if(this.mode === "xwax") {
				url = window.sliMpd.setGetParameter(url, "deck", this.deckIndex);
				if(this.showWaveform === false) {
					url = window.sliMpd.setGetParameter(url, "type", "djscreen");
				} 
			} else {
				url = window.sliMpd.setGetParameter(url, "item", item.item);
			}

			$.ajax({
				url: url
			}).done(function(response){
				// place markup in DOM
				this._template = _.template(response);
				this.rendered = false;
				this.render(true);
				this.onRedrawComplete(item);
				this.reloadCss(item.hash);
			}.bind(this));
		},
		onRedrawComplete(item) { return; },

		// highlight state icons when state is active
		updateStateIcons() {
			var that = this;
			["repeat", "random", "consume"].forEach(function(prop) {
				if(that.state[prop] == "1") {
					$(".status-"+prop, that.$el).addClass("active");
				} else {
					$(".status-"+prop, that.$el).removeClass("active");
				}
			});
		},

		process(item) {
			//console.log("AbstractPlayer::process()"); console.log(item);
			switch(item.action) {
				case "play": this.play(item); break;
				case "pause":this.pause(item); break;
				case "togglePause": this.togglePause(item); break;
				case "toggleRepeat": this.toggleRepeat(item); break;
				case "toggleRandom": this.toggleRandom(item); break;
				case "toggleConsume": this.toggleConsume(item); break;
				case "next": this.next(item); break;
				case "prev": this.prev(item); break;
				case "seek": this.seek(item); break;
				case "seekzero": this.seekzero(item); break;
				case "remove": this.remove(item); break;
				case "softclearPlaylist":	 this.softclearPlaylist(item); break;

				case "appendTrack":			this.appendTrack(item);				break;
				case "appendTrackAndPlay":	 this.appendTrackAndPlay(item);		 break;
				case "injectTrack":			this.injectTrack(item);				break;
				case "injectTrackAndPlay":	 this.injectTrackAndPlay(item);		 break;
				case "replaceTrack":		   this.replaceTrack(item);			   break;
				case "softreplaceTrack":	   this.softreplaceTrack(item);		   break;

				case "appendDir":			  this.appendDir(item);				  break;
				case "appendDirAndPlay":	   this.appendDirAndPlay(item);		   break;
				case "injectDir":			  this.injectDir(item);				  break;
				case "injectDirAndPlay":	   this.injectDirAndPlay(item);		   break;
				case "replaceDir":			 this.replaceDir(item);				 break;
				case "softreplaceDir":		 this.softreplaceDir(item);			 break;

				case "appendPlaylist":		 this.appendPlaylist(item);			 break;
				case "appendPlaylistAndPlay":  this.appendPlaylistAndPlay(item);	  break;
				case "injectPlaylist":		 this.injectPlaylist(item);			 break;
				case "injectPlaylistAndPlay":  this.injectPlaylistAndPlay(item);	  break;
				case "replacePlaylist":		this.replacePlaylist(item);			break;
				case "softreplacePlaylist":	this.softreplacePlaylist(item);		break;

				case "soundEnded": this.soundEnded(item); break;
				case "removeDupes": this.removeDupes(item); break;
				default:
					console.log("ERROR: invalid action \""+ item.action +"\" in "+ this.mode +"Player-item. exiting...");
					return;
			}

		},

		// define those methods in inherited implementation of AbstractPlayer
		play(item) { return; },
		pause(item) { return; },
		togglePause(item) { return; },
		toggleRepeat(item) {
			this.state.repeat = (this.state.repeat == 1) ? 0 : 1;
			this.updateStateIcons();
		},
		toggleRandom(item) {
			this.state.random = (this.state.random == 1) ? 0 : 1;
			this.updateStateIcons();
		},
		toggleConsume(item) {
			this.state.consume = (this.state.consume == 1) ? 0 : 1;
			this.updateStateIcons();
		},
		setPlayPauseIcon() { return; },
		next(item) { return; },
		prev(item) { return; },
		seek(item) { return; },
		seekzero(item) { return; },
		remove(item) { return; },

		softclearPlaylist(item) { return; },

		appendTrack(item) { return; },
		appendTrackAndPlay(item) { return; },
		injectTrack(item) { return; },
		injectTrackAndPlay(item) { return; },
		replaceTrack(item) { return; },
		softreplaceTrack(item) { return; },

		appendDir(item) { return; },
		appendDirAndPlay(item) { return; },
		injectDir(item) { return; },
		injectDirAndPlay(item) { return; },
		replaceDir(item) { return; },
		softreplaceDir(item) { return; },

		appendPlaylist(item) { return; },
		appendPlaylistAndPlay(item) { return; },
		injectPlaylist(item) { return; },
		injectPlaylistAndPlay(item) { return; },
		replacePlaylist(item) { return; },
		softreplacePlaylist(item) { return; },

		soundEnded(item) { return; },
		removeDupes(item) { return; },

		reloadCss(hash) {
			// TODO: comment whats happening here
			// FIXME: mpd-version is broken since backbonify
			var suffix, selector;
			if(this.mode === "xwax") {
				suffix = "?deck=" + this.deckIndex;
				selector = "#css-xwaxdeck-"+ this.deckIndex;
			} else {
				suffix = "";
				selector = "#css-"+this.mode+"player";
			}
			$(selector).attr("href", sliMpd.conf.absRefPrefix + "css/"+ this.mode +"player/"+ ((hash) ? hash : "0") + suffix);

		},

		drawFavicon() {
			FavIconX.config({
				updateTitle: false,
				shape: "doughnut",
				doughnutRadius: 7,
				overlay: this.nowPlayingState,
				overlayColor : this.faviconDoghnutColor,
				borderColor: this.faviconDoghnutColor,
				fillColor: this.faviconDoghnutColor,
				borderWidth : 1.2,
				backgroundColor : this.faviconBackgroundColor,
				titleRenderer: function(v, t){
					return $(".player-"+ this.mode +" .now-playing-string").text();
				}
			}).setValue(this.nowPlayingPercent);
		},

		drawTimeGrid() {
			if(this.nowPlayingDuration <= 0) {
				return;
			}

			var cnv = document.getElementById(this.timeGridSelectorCanvas);
			if(cnv === null) {
				return;
			}
			var width = $(this.timeGridSelectorSeekbar).width();
			var height = 10;

			$("."+this.timeGridSelectorCanvas).css("width", width + "px");
			cnv.width = width;
			cnv.height = height;
			var ctx = cnv.getContext("2d");

			var strokePerHour = 60;
			var changeColorAfter = 5;
			//$.jPlayer.timeFormat.showHour = false;

			// draw stroke at zero-position
			ctx.fillStyle = this.timeGridStrokeColor2;
			ctx.fillRect(0,0,1,height);

			// longer than 30 minutes
			if(this.nowPlayingDuration > 1800) {
				strokePerHour = 12;
				changeColorAfter = 6;
			}

			// longer than 1 hour
			if(this.nowPlayingDuration > 3600) {
				strokePerHour = 6;
				changeColorAfter = 6;
				//$.jPlayer.timeFormat.showHour = true;
			}
			var pixelGap = width / this.nowPlayingDuration * (3600/ strokePerHour); 

			for (var i=0; i < this.nowPlayingDuration/(3600/strokePerHour); i++) {
				ctx.fillStyle = ((i+1)%changeColorAfter == 0) ? this.timeGridStrokeColor2 : this.timeGridStrokeColor;
				ctx.fillRect(pixelGap*(i+1),0,1,height);
			}

			ctx.globalCompositeOperation = "destination-out";
			ctx.fill();
		},

		drawWaveform() {
			// thanks to https://github.com/Idnan/SoundCloud-Waveform-Generator
			var $waveFormWrapper = $("#"+ this.mode +"-waveform-wrapper");
			$waveFormWrapper.html(
				$("<p />").html("generating waveform...")
			);

			this.waveformSettings.waveColor = this.timeGridStrokeColor2,
			this.waveformSettings.canvas = document.createElement("canvas"),
			this.waveformSettings.context = this.waveformSettings.canvas.getContext("2d");
			this.waveformSettings.canvas.width = $waveFormWrapper.width();
			this.waveformSettings.canvas.height = $waveFormWrapper.height();
			this.waveformSettings.barWidth = window.sliMpd.conf.waveform.barwidth;
			this.waveformSettings.barGap = window.sliMpd.conf.waveform.gapwidth;
			this.waveformSettings.mirrored = ($("body").hasClass("slimplayer"))
				? 0
				: window.sliMpd.conf.waveform.mirrored;
			var that = this;

			$.getJSON($waveFormWrapper.attr("data-jsonurl") , function( vals ) {
				var len = Math.floor(vals.length / that.waveformSettings.canvas.width);
				var maxVal = vals.max();
				for (var j = 0; j < that.waveformSettings.canvas.width; j += that.waveformSettings.barWidth) {
					that.drawBar(
						j,
						(that.bufferMeasure(Math.floor(j * (vals.length / that.waveformSettings.canvas.width)), len, vals) * maxVal/10)
						*
						(that.waveformSettings.canvas.height / maxVal)
						+
						1
					);
				}
				$waveFormWrapper.html("");
				$(that.waveformSettings.canvas).appendTo($waveFormWrapper);
			});

		},

		bufferMeasure(position, length, data) {
			var sum = 0.0;
			for (var i = position; i <= (position + length) - 1; i++) {
				sum += Math.pow(data[i], 2);
			}
			return Math.sqrt(sum / data.length);
		},

		drawBar(i, h) {
			this.waveformSettings.context.fillStyle = this.waveformSettings.waveColor;
			var w = this.waveformSettings.barWidth;
			if (this.waveformSettings.barGap !== 0) {
				w *= Math.abs(1 - this.waveformSettings.barGap);
			}
			var x = i + (w / 2);
			var y = this.waveformSettings.canvas.height - h;

			if(this.waveformSettings.mirrored === 1) {
				y /=2;
			}

			this.waveformSettings.context.fillRect(x, y, w, h);
		},

		/* only for polled mpd player implementation - begin */
		refreshInterval() {
			this.pollWorker.postMessage({
				cmd: "refreshInterval"
			});
		},
		pollWorker : null,
		processPollData(data) { return; },
		/* only for polled mpd player implementation - end */


		/* only for mpd player progressbar implementation/interpolation - begin */
		trackAnimation : null,
		timeLineLight : null,
		timelineSetValue(value) { return; },
		updateSlider() { return; }
		/* only for polled mpd player implementation/interpolation  - end */

		
	});
}());