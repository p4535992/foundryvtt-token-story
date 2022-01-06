/*
 * Alphabet Picker jQuery Plugin version 1.0.1
 * Chris Cook - chris@chris-cook.co.uk
 */

(function ($) {
  'use strict';

  $.fn.alphabetPicker = function (options) {
    $('body').append(`<ul id="azp-container">
    <li>A</li>
    <li>B</li>
    <li>C</li>
    <li>D</li>
    <li>E</li>
    <li>F</li>
    <li>G</li>
    <li>H</li>
    <li>I</li>
    <li>J</li>
    <li>K</li>
    <li>L</li>
    <li>M</li>
    <li class="azp-breaker">N</li>
    <li>O</li>
    <li>P</li>
    <li>Q</li>
    <li>R</li>
    <li>S</li>
    <li>T</li>
    <li>U</li>
    <li>V</li>
    <li>W</li>
    <li>X</li>
    <li>Y</li>
    <li>Z</li>
    </ul>`);

    var settings = $.extend(
        {
          destination: 'demo.html',
          hash: false,
          parameterName: 'letter',
          uppercase: false,
          topPosition: '20%',
          leftPosition: '30%',
        },
        options,
      ),
      $alphabetTriggers = this,
      $alphabetPicker = $('#azp-container'),
      $letters = $alphabetPicker.children('li');

    if (settings.uppercase) {
      $letters.css('textTransform', 'uppercase');
    }

    $alphabetPicker.css('top', settings.topPosition).css('left', settings.leftPosition);

    $alphabetTriggers.click(function () {
      $alphabetPicker.fadeToggle('fast');
    });

    $alphabetPicker.on('click', 'li', function () {
      // if (settings.hash) {
      // 	location.href = settings.destination + '#' + $(this).html();
      // } else {
      // 	location.href = settings.destination + '?' + settings.parameterName + '=' + $(this).html();
      // }
      const container = $('.containerLetters');
      const id = '#' + $(this).html(); //$(this).attr('href');
      const scrollTo = $(id);

      container.animate({
        scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop(),
      });
    });

    return this;
  };
})(jQuery);
