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

function LoadYoutubeAPI() {
    console.log('Loading Youtube API...');
    $.getScript("https://www.youtube.com/iframe_api");
}

function LoadPlayer(youtube_settings) {

    var player;
    var youtube_interval;

    player = new YT.Player('player', {
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
            fs:0,
        },
        events: {
            onStateChange: onPlayerStateChange
        }
    });

//Voor het opnieuw laden van de video als deze afgelopen is
    function onPlayerStateChange(event) {
        if (event.data === -1) {
            $('.erasmus-youtube-cover').addClass('show');
        }

        if (event.data === 0) {
            player.loadVideoById({
                videoId: youtube_settings.videoId,
                startSeconds: youtube_settings.startSeconds,
                endSeconds: youtube_settings.endSeconds
            });
            $('.erasmus-youtube-cover').removeClass('show');
            player.pauseVideo();
            clearInterval(youtube_interval);
        }

        if (event.data === 1) {
            $('.erasmus-youtube-cover').addClass('show');
            showRemainingTime();
        }

        if (event.data === 2) {
            $('.erasmus-youtube-cover').removeClass('show');
            clearInterval(youtube_interval);
        }
    }

    $('.erasmus-youtube-cover').click(function () {
        player.playVideo();
    });


    function showRemainingTime(){

        var start_time = youtube_settings.startSeconds ? youtube_settings.startSeconds : player.getCurrentPosition();
        var end_time = youtube_settings.endSeconds ? youtube_settings.endSeconds : player.getDuration();
        var time_remaining = end_time - start_time;
        var time_elapsed = 0;
        var count_down = document.getElementById('erasmus-youtube-countdown');
        youtube_interval = setInterval(function () {
            time_elapsed++;
            console.log(time_remaining - time_elapsed);
            count_down.innerText = (time_remaining - time_elapsed);
        },1000);
    }

}

function AddYouTubeVideo(youtube_settings) {

    var tries = 0;

    try {
        LoadPlayer(youtube_settings);
        console.log("Youtube Succesfully Loaded");
        this.break;
    } catch (err) {

        if (tries < 30) {

            tries++;
            console.log("Youtube not loaded yet: Trying again...");
            LoadYoutubeAPI();
            setTimeout(function () {
                AddYouTubeVideo(youtube_settings)
            }, 250);

            console.log("Trying " + (30 - tries) + " more times...");
        } else {
            alert("Helaas, YouTube video kon niet geladen worden...");
            this.break;
        }

    }

}



///////////////////////////////////////////////////////////////////////////////////////////////