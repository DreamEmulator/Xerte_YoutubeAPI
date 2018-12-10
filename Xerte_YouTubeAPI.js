/////////////////////////// Op de specifieke Xerte pagina - SCRIPT: ///////////////////////////
var youtube_settings = {

    //Aanpassen naar wens
    videoId: 'FLd00Bx4tOk',
    startSeconds: 10,
    endSeconds: 15,
    mute: 1,

    //Beter zo laten
    load: function () {
        try {
            $.xerte.youtube(youtube_settings);
            this.break;
        } catch {
            console.log('Xerte JS not loaded yet...');
            setTimeout(function () {
                youtube_settings.load();
            }, 250);
        }
    }
}

//Deze niet vergeten
youtube_settings.load();

///////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////Op de start pagina van de Xerte Module - SCRIPT://///////////////////////
$.getScript('https://coo.erasmusmc.nl/xerte/js/xerte_erasmus.js');

var youtube_load_api_attempts = 0;
var erasmus_youtube_interval;

function LoadYoutubeAPI() {
    console.log('Loading Youtube API...');
    $.getScript("https://www.youtube.com/iframe_api");
}

function Load_Player(youtube_settings) {

    function pretty_time(secs) {
        var sec_num = parseInt(secs, 10)
        var hours = Math.floor(sec_num / 3600) % 24
        var minutes = Math.floor(sec_num / 60) % 60
        var seconds = sec_num % 60

        return [minutes, seconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":")

    };

    var erasmus_youtube_times_played = 0;
    var erasmus_youtube_loop_ref = [-1, 3];
    var erasmus_youtube_loop = [];

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

//Voor het opnieuw laden van de video als deze afgelopen is
    function onPlayerStateChange(event) {

        erasmus_youtube_loop.push(event.data);

        if (JSON.stringify(erasmus_youtube_loop).indexOf(JSON.stringify(erasmus_youtube_loop_ref)) !== -1 && erasmus_youtube_times_played !== 0) {
            erasmus_youtube_player.pauseVideo();
            erasmus_youtube_loop = [];
        }

        // -1 – unstarted
        // 0 – ended
        // 1 – playing
        // 2 – paused
        // 3 – buffering
        // 5 – video cued

        if (event.data === -1) {
            $('#erasmus-youtube-container').removeClass('play');
        }

        if (event.data === 0) {
            clearInterval(erasmus_youtube_interval);
            erasmus_youtube_player.loadVideoById({
                videoId: youtube_settings.videoId,
                startSeconds: youtube_settings.startSeconds,
                endSeconds: youtube_settings.endSeconds
            });
            erasmus_youtube_loop = [];
            erasmus_youtube_times_played++;
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
        $('#erasmus-youtube-container').addClass('play');
        erasmus_youtube_player.playVideo();
    });

    function showRemainingTime() {
        clearInterval(erasmus_youtube_interval);
        var start_time = youtube_settings.startSeconds ? youtube_settings.startSeconds : erasmus_youtube_player.getCurrentPosition();
        var end_time = youtube_settings.endSeconds ? youtube_settings.endSeconds : erasmus_youtube_player.getDuration();
        var time_remaining = end_time - start_time;
        var time_elapsed = 0;
        var count_down = document.getElementById('erasmus-youtube-countdown');
        erasmus_youtube_interval = setInterval(function () {
            time_elapsed++;
            count_down.innerText = (pretty_time(time_remaining - time_elapsed));
        }, 1000);
    }

}

function AddYouTubeVideo(youtube_settings) {

    try {
        Load_Player(youtube_settings);
        console.log("Youtube Succesfully Loaded");
        $('#erasmus-youtube-container').removeClass('play');
        this.break;
    } catch (err) {

        if (youtube_load_api_attempts < 30) {

            youtube_load_api_attempts++;
            console.log("Loading YouTube API...");
            LoadYoutubeAPI();
            setTimeout(function () {
                AddYouTubeVideo(youtube_settings)
            }, 250);

        } else {
            alert("Helaas, YouTube video kon niet geladen worden...");
            this.break;
        }

    }
}


///////////////////////////////////////////////////////////////////////////////////////////////