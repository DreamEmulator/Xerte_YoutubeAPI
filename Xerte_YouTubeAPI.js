/////////////////////////// Op de specifieke Xerte pagina - SCRIPT: ///////////////////////////
var settings = {
    videoId: 'rAt1vxwQG9c',
    startSeconds: 0,
    endSeconds: 0,
    mute: 0,
}
AddYouTubeVideo(settings);


///////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////Op de start pagina van de Xerte Module - SCRIPT://///////////////////////
$.getScript('https://coo.erasmusmc.nl/xerte/js/xerte_erasmus.js');

function LoadYoutubeAPI() {
    console.log('Loading Youtube API...');
    $.getScript("https://www.youtube.com/iframe_api");
}

function LoadPlayer(settings) {

    var player;

    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: settings.videoId,
        playerVars: {
            start: settings.startSeconds,
            end: settings.endSeconds,
            mute: settings.mute,
            showInfo: 0,
            controls: 0,
            rel: 0,
            iv_load_policy: 3,
            playsinline: 1
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
                videoId: settings.videoId,
                startSeconds: settings.startSeconds,
                endSeconds: settings.endSeconds
            });
            $('.erasmus-youtube-cover').removeClass('show');
            player.pauseVideo()
        }

        if (event.data === 1) {
            $('.erasmus-youtube-cover').addClass('show');
        }

        if (event.data === 2) {
            $('.erasmus-youtube-cover').removeClass('show');
        }
    }

    $('.erasmus-youtube-cover').click(function () {
        player.playVideo();
    });


}

var tries = 0;

function AddYouTubeVideo(settings) {

    try {
        LoadPlayer(settings);
        console.log("Youtube Succesfully Loaded");
        this.break;
    } catch (err) {

        if (tries < 30) {

            tries++;
            console.log("Youtube not loaded yet: Trying again...");
            LoadYoutubeAPI();
            setTimeout(function () {
                AddYouTubeVideo(settings)
            }, 250);

            console.log("Trying " + (30 - tries) + " more times...");
        } else {
            alert("Helaas, YouTube video kon niet geladen worden...");
            this.break;
        }

    }

}


///////////////////////////////////////////////////////////////////////////////////////////////