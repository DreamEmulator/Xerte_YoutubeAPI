(function ($) {
    $.xerte = (function () {
        return {
            init: function () {
                console.log("===>Erasmus Xerte Customization Enabled<===");
                $.xerte.menuDetect();
                $.xerte.appendStyles();
                $.xerte.magnify();
                $.xerte.multipleChoice();
                //$.xerte.youtube();
                //$.xerte.show_tracking_info();
                setTimeout(function () {
                    $.xerte.ios_fallback();
                }, 500);
            },
            appendStyles: function () {
                $('body').append('<link rel="stylesheet" href="https://coo.erasmusmc.nl/xerte/css/xerte_erasmus.css" type="text/css"><link href="https://fonts.googleapis.com/css?family=Open+Sans|PT+Sans|Roboto|Rubik" rel="stylesheet">');
            },
            date: function () {
                var getDate = new Date();
                getDate = getDate.getFullYear();
                if ($("p:contains('[[JAAR]]')").length > 0) {
                    $($("p:contains('[[JAAR]]')")[0]).html($($("p:contains('[[JAAR]]')")[0]).text().replace('[[JAAR]]', getDate));
                }
            },
            ios_fallback: function () {
                if ($($('#x_pageHolder').css('margin-top').split('px'))[0] > 200) {
                    var header = $('#x_headerBlock').height(),
                        footer = $('#x_footerBlock').height(),
                        body = $(window).height() - (header + footer);
                    $('#x_pageHolder').css({'min-height': body, 'margin-top': header});
                }
                $("#pageContents").css("opacity", "1");
            },
            magnify: function () {

                $(document).ajaxStop(function () {
                    if ($('.klik_vergroting').length == 0) {
                        $('img[alt="magnify"]').parent().append("<p class='klik_vergroting' style='font-style: italic; font-size: 10px'>Klik op de afbeelding voor een vergroting.</p>");
                    }
                });

                $(document).on('click touchend', function (e) {

                    switch (e.target.getAttribute('alt')) {
                        case 'magnify':
                            $('<div class="magnify_shade"></div>').appendTo($('body'));
                            $(e.target).clone().removeAttr('alt').addClass('magnified').appendTo($("body"));
                            break;
                    }

                    switch ($(e.target).attr('class')) {
                        case 'magnified':
                        case 'magnify_shade' :
                            $('.magnify_shade, .magnified').css({'animation': 'fade_out 0.5s'});
                            setTimeout(function () {
                                $('.magnify_shade, .magnified').remove()
                            }, 400);
                            break;
                    }
                });

            },
            multipleChoice: function () {

                $(document).on('click touchend', function (e) {
                    if (e.target.parentNode.id == 'checkBtn') {

                        var answers = $('#pageContents').data('optionElements') || quiz.currentAnswers;
                        var x = 0;

                        $.xerte.tracking_info.checked_answers = [];
                        $.xerte.tracking_info.correct_answers = [];
                        $.xerte.tracking_info.wrong_answers = [];
                        $(answers).each(function () {

                            if (this.correct == 'true') {
                                $($('.optionGroup')[x]).css({
                                    'background-color': '#b5e8b4',
                                    'border-radius': '5px',
                                    'line-height': '22px',
                                    'margin': '8px 0px',
                                    'vertical-align': 'middle'
                                });

                                //Mark as correct
                                if ($("#option" + x + ":checked").val() !== undefined) {
                                    $($('.optionGroup')[x]).addClass('correct_answer');
                                    $.xerte.tracking_info.checked_answers.push(x);
                                    $.xerte.tracking_info.correct_answers.push(x);
                                } else {
                                    $($('.optionGroup')[x]).removeClass('correct_answer');
                                }

                                //Mark as wrong
                                if ($("#option" + x + ":checked").val() == undefined) {
                                    $($('.optionGroup')[x]).addClass('wrong_answer');
                                    $.xerte.tracking_info.wrong_answers.push(x);
                                } else {
                                    $($('.optionGroup')[x]).removeClass('wrong_answer');
                                }

                            } else {
                                $($('.optionGroup')[x]).css({
                                    'background-color': '#ff9497',
                                    'border-radius': '5px',
                                    'line-height': '22px',
                                    'margin': '8px 0px',
                                    'vertical-align': 'middle'
                                });
                                //Mark as correct
                                if ($("#option" + x + ":checked").val() == undefined) {
                                    $($('.optionGroup')[x]).addClass('correct_answer');
                                    $.xerte.tracking_info.correct_answers.push(x);
                                } else {
                                    $($('.optionGroup')[x]).removeClass('correct_answer');
                                }

                                //Mark as wrong
                                if ($("#option" + x + ":checked").val() !== undefined) {
                                    $($('.optionGroup')[x]).addClass('wrong_answer');
                                    $.xerte.tracking_info.checked_answers.push(x);
                                    $.xerte.tracking_info.wrong_answers.push(x);
                                } else {
                                    $($('.optionGroup')[x]).removeClass('wrong_answer');
                                }

                            }
                            x++;
                        });
                        $('#x_prevBtn, #x_nextBtn').on('click touchend', function (e) {
                            $('.optionGroup').css({'background-color': 'rgba(0,0,0,0)'});
                        });
                        //$.xerte.tracking();
                    }
                    ;
                });
            },
            youtube: function (youtube_Settings) {
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

                AddYouTubeVideo(youtube_settings);

            },
            menu: function () {
                if ($("#pageContents figure figcaption a[onclick*='x_navigateToPage']").length > 0 && $('.xertelitemenu.loaded').length == 0) {
                    $("#pageContents").css("opacity", "1");
                    $("#x_page0").css("visibility", "visibles");
                    $('.xertelitemenu').addClass('loaded');
                    console.log('XerteLiteMenu activated');
                    $('head').append('<link rel="stylesheet" href="https://coo.erasmusmc.nl/xerte/css/xerte_menu.css" type="text/css">');
                    $("#pageContents").addClass("xertelitemenu");
                    x = $("#pageContents figcaption a").length;
                    for (n = 0; n <= x + 1; n++) {
                        var getLink = $("figcaption a:eq(" + n + ")").attr("onClick");
                        $("figure:eq(" + n + ")").wrap('<a href="#" onclick=' + getLink + '"> </a>');
                    }
                    ;
                    $('#pageContents').children().wrapAll("<div class='menuConnector'></div>");
                }
            },
            menuDetect: function () {


                if ($("#pageContents  figure  figcaption a[onclick^='x_navigateToPage']").length > 0 && $('.xertelitemenu.loaded').length == 0) {
                    $.xerte.menu();
                    setTimeout(function () {
                        if ($('#x_page0').length > 0) {
                            $('#x_page0').css({"visibility": "visible"});
                        }
                        $("#pageContents").css("opacity", "1");
                    }, 500);
                }
                ;

                $(document).ajaxSuccess(function () {
                    if ($("#pageContents  figure  figcaption a[onclick^='x_navigateToPage']").length > 0 && $('.xertelitemenu.loaded').length == 0) {
                        console.log("Menu detected");
                        $.xerte.menu();
                        setTimeout(function () {
                            if ($('#x_page0').length > 0) {
                                $('#x_page0').css({"visibility": "visible"});
                            }
                            $("#pageContents").css("opacity", "1");
                        }, 500);
                    }
                    ;
                });
            },
            tracking: function () {
                if ($('.x_mcq_page').length > 0 || $('.x_quiz_page').length > 0 && window.location.href.split('preview').length < 2) {
                    console.log("Tracking Multiple Choice Question...");
                    $.xerte.tracking_info.module = window.location.href.split('id=')[1].split('&linkID')[0];
                    $.xerte.tracking_info.page = $('#x_pageDiv div:first-child').attr('id').split('x_page')[1];
                    $.xerte.tracking_info.correct = $('.correct_answer').length;
                    $.xerte.tracking_info.wrong = $('.wrong_answer').length;
                    $.xerte.tracking_info.options = $('.optionGroup').length;
                    $.xerte.tracking_info.session = document.cookie.split('PHPSESSID=')[1];
                    $.xerte.tracking_info.file_location = FileLocation;

                    var data = JSON.stringify($.xerte.tracking_info);

                    $.ajax({
                        url: 'https://coo.erasmusmc.nl/xerte/tracking/tracking.php',
                        data: "data=" + data
                    }).done(
                        function (result) {
                            console.log(result);
                        }
                    )
                }
            },
            tracking_info: {
                module: 0,
                file_location: null,
                options: 0,
                checked_answers: [],
                correct: 0,
                correct_answers: [],
                wrong: 0,
                wrong_answers: [],
                session: null,
                key: "none"
            },
            show_tracking_info: function () {
                if (window.location.href.split('preview').length == 2) {

                    console.log("Preview mode detected...");
                    var module = window.location.href.split('template_id=')[1];

                    $.get("https://coo.erasmusmc.nl/xerte/tracking/share.php?module=" + module, function (response) {
                        response = '<div>' + response + '</div>';
                        response = response.replace(/<img\b[^>]*>/ig, '');
                        if ($($(response).find('h6:contains(Antwoorden)').text().split('Antwoorden: '))[1] > 0) {
                            console.log('Results availible...');
                            $('body').append("<a href='https://coo.erasmusmc.nl/xerte/tracking/share.php?module=" + module + "' target='_blank'><div id='resultaten'>Resultaten</div></a>");
                        } else {
                            console.log('No results yet...');
                        }
                    });

                }
            }
        }
    })();

})(jQuery);

$(document).ready(function () {
    $.xerte.init();
});
