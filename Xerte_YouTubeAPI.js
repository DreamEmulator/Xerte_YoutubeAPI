/////////////////////////// Op de specifieke Xerte pagina - SCRIPT: ///////////////////////////
var youtube_settings = {
    videoId: 'rAt1vxwQG9c',
    startSeconds: 0,
    endSeconds: 0,
    mute: 0,
}
AddYouTubeVideo(youtube_settings);


///////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////Op de start pagina van de Xerte Module - SCRIPT://///////////////////////
$.getScript('https://coo.erasmusmc.nl/xerte/js/xerte_erasmus.js');

var youtube_load_api_attempts = 0;

function LoadYoutubeAPI() {
    console.log('Loading Youtube API...');
    $.getScript("https://www.youtube.com/iframe_api");
}

function Load_Player(youtube_settings) {

    var erasmus_youtube_interval;
    var erasmus_youtube_player = new YT.Player('erasmus-youtube-player', {
        height: '390',
        width: '640',
        videoId: youtube_settings.videoId,
        playerVars: {
            start: youtube_settings.startSeconds,
            end: youtube_settings.endSeconds,
            mute: youtube_settings.mute,
            showInfo: 0,
            controls: 0,
            rel: 0,
            iv_load_policy: 3,
            playsinline: 1,
            fs: 0,
        },
        events: {
            onStateChange: onPlayerStateChange
        }
    });

    var loop_ref = [-1,3];
    var loop = [];

//Voor het opnieuw laden van de video als deze afgelopen is
    function onPlayerStateChange(event) {

        loop.push(event.data);
        console.log(loop);

        if (JSON.stringify(loop).indexOf(JSON.stringify(loop_ref)) !== -1 ){
            erasmus_youtube_player.pauseVideo();
            loop = [];
        }

        if (event.data === 0) {
            clearInterval(erasmus_youtube_interval);
            erasmus_youtube_player.loadVideoById({
                videoId: youtube_settings.videoId,
                startSeconds: youtube_settings.startSeconds,
                endSeconds: youtube_settings.endSeconds
            });
            loop = [];
            $('#erasmus-youtube-container').removeClass('play');
        }

        if (event.data === 1) {
            $('#erasmus-youtube-container').addClass('play');
            showRemainingTime();
        }

        if (event.data === 2) {
            $('#erasmus-youtube-container').removeClass('play');
            clearInterval(erasmus_youtube_interval);
        }

    }

    $('.erasmus-youtube-cover').click(function () {
        erasmus_youtube_player.playVideo();
    });

    function showRemainingTime() {

        var start_time = youtube_settings.startSeconds ? youtube_settings.startSeconds : erasmus_youtube_player.getCurrentPosition();
        var end_time = youtube_settings.endSeconds ? youtube_settings.endSeconds : erasmus_youtube_player.getDuration();
        var time_remaining = end_time - start_time;
        var time_elapsed = 0;
        var count_down = document.getElementById('erasmus-youtube-countdown');
        erasmus_youtube_interval = setInterval(function () {
            time_elapsed++;
            count_down.innerText = (time_remaining - time_elapsed);
        }, 1000);
    }

}

function AddYouTubeVideo(youtube_settings) {

    var erasmus_youtube_player = document.getElementById('erasmus-youtube-player')

    if (erasmus_youtube_player.tagName == 'IFRAME') {
        var new_youtube_player = document.createElement('div');
        new_youtube_player.setAttribute('id','erasmus-youtube-player');
        document.getElementById('erasmus-youtube-container').append(new_youtube_player);
        erasmus_youtube_player.remove();
    }

    try {
        Load_Player(youtube_settings);
        console.log("Youtube Succesfully Loaded");
        youtube_api_loaded_succesfully = true;
        this.break;
    } catch (err) {

        if (youtube_load_api_attempts < 30) {

            youtube_load_api_attempts++;
            console.log("Youtube not loaded yet: Trying again...");
            LoadYoutubeAPI();
            setTimeout(function () {
                AddYouTubeVideo(youtube_settings)
            }, 250);

            console.log("Trying " + (30 - youtube_load_api_attempts) + " more times...");
        } else {
            alert("Helaas, YouTube video kon niet geladen worden...");
            this.break;
        }

    }

}


///////////////////////////////////////////////////////////////////////////////////////////////