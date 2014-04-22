/*
 * static variables
 */
var MACHINE;
var WHEELS = new Array('0');
var REFLECTORS = new Array();
var PLUGBOARD;

/*
 * create machine, wheels & reflectors
 */
window.onload = function(e) {
    createObjects();
    setSelectedWheels();
    createButtons();
};

/*
 * catch entered text via keybaord
 */
$(this).keyup(function(e) {
    var char = String.fromCharCode(e.which);
    if (e.which >= 65 && e.which <= 90) {
        //char between A-Z or whitespace pressed
        $('#inputButton' + char).css('border-style', 'inset');
        $('#inputButton' + char).click();
        setTimeout(function() {
            $('#inputButton' + char).css('border-style', '');
        }, 100);
    } else if (e.which === 32) {
        validCharPressed(' ');
    } else if (e.which === 8) {
        //backslash pressed
        backslashPressed();
    }
});

/*
 * catch clicked button
 */
function catchClickedButton() {
    $('[class="button keyboardButton"]').on('click', function(e) {
        validCharPressed(e.target.defaultValue);
    });
}

/*
 * catch reset button
 */
$('.glyphicon-remove-circle').on('click', function(e) {
    resetMachine();
});

/*
 * catch about link
 */
$('#aboutLink').on('click', function(e) {
    $('#aboutDialog').modal();
    return false;
});

/*
 * prevent navigate back by pressing backslash
 */
$(this).keydown(function(e) {
    if (e.which === 8 || e.which === 32) {
        e.preventDefault();
    }
    if (e.which === 27) {
        $('#closeAboutDialog').click();
    }
});

/*
 * resize buttons when window is resized
 */
$(window).bind("resize", function(e) {
    resizeButtons();
});

function resizeButtons() {
    var width = $('[class="button"]').outerWidth();
    $('[class="button"]').css('height', width);
    $('[class="button keyboardButton"]').css('height', width);
    if (width <= 25) {
        $('[class="button"]').css({'font-size': 'small', 'margin': ''});
        $('[class="button keyboardButton"]').css({'font-size': 'small', 'margin': ''});
    } else if (width <= 35) {
        $('[class="button"]').css({'font-size': 'inherit', 'margin': ''});
        $('[class="button keyboardButton"]').css({'font-size': 'inherit', 'margin': ''});
    } else {
        $('[class="button"]').css({'font-size': 'large', 'margin-left': ''});
        $('[class="button keyboardButton"]').css({'font-size': 'large', 'margin-left': ''});
    }
}

/*
 * catch change wheel button
 */
$('.selectWheel a').on('click', function(e) {
    var state = e.target.parentElement.className;
    if (state.match(/disabled/) || state.match(/active/)) {
        return false;
    }
    resetMachine();
    if (state.match(/reflector/)) {
        var number = state.substring(9, 10);
        MACHINE.reflector = REFLECTORS[number];
    } else {
        var number = state.substring(5, 6);
        var wheel = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.id;
        wheel = wheel.substring(0, wheel.length - 3);
        WHEELS[number].changeStartPosition('A');
        MACHINE[wheel] = WHEELS[number];
    }
    setSelectedWheels();
    return false;
});


/*
 * catch change wheel position button
 */
$('.selectPosition a').on('click', function(e) {
    var action = e.target.parentElement.className.substring(3, 20);
    var wheel = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.id;
    wheel = wheel.substring(0, wheel.length - 3);
    if (action === 'PreviousPosition') {
        resetMachine();
        MACHINE[wheel].decrementStartPosition();
    } else if (action === 'NextPosition') {
        resetMachine();
        MACHINE[wheel].incrementStartPosition();
    }
    setWheelStartPositions();
    return false;
});




/*
 * functions
 */
function validCharPressed(char) {
    $('#inputTextField').html($('#inputTextField').html() + char);
    if (' ' === char) {
        $('#outputTextField').html($('#outputTextField').html() + char);
    } else {
        var encryptedChar = MACHINE.encryptChar(char);
        glowLampButton(encryptedChar);
        $('#outputTextField').html($('#outputTextField').html() + encryptedChar);
        setWheelCurrentPositions();
    }
}

function backslashPressed() {
    var text = $('#outputTextField').html();
    $('#outputTextField').html(text.substring(0, text.length - 1));
    text = $('#inputTextField').html();
    $('#inputTextField').html(text.substring(0, text.length - 1));
    if (text.replace(/\s+/g, '') !== $('#inputTextField').html().replace(/\s+/g, '')) {
        MACHINE.undoRotateWheel();
        setWheelCurrentPositions();
    } else {
        showError('Unfortunatly an error is occured, please start again!');
        resetMachine();
    }
}

function glowLampButton(char) {
    $('#lampButton' + char).css({'color': 'yellow', 'background-color': '#3B3B3B'});
    setTimeout(function() {
        $('#lampButton' + char).css({'color': '', 'background-color': ''});
    }, 300);
}


function createObjects() {
    WHEELS[1] = new Wheel('1', 'A', 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q');
    WHEELS[2] = new Wheel('2', 'A', 'AJDKSIRUXBLHWTMCQGZNPYFVOE', 'E');
    WHEELS[3] = new Wheel('3', 'A', 'BDFHJLCPRTXVZNYEIWGAKMUSQO', 'V');
    WHEELS[4] = new Wheel('4', 'A', 'ESOVPZJAYQUIRHXLNFTGKDCMWB', 'J');
    WHEELS[5] = new Wheel('5', 'A', 'VZBRGITYUPSDNHLXAWMJQOFECK', 'Z');
    REFLECTORS['B'] = new Reflector('B', 'AY BR CU DH EQ FS GL IP JX KN MO TZ VW');
    REFLECTORS['C'] = new Reflector('C', 'AF BV CP DJ EI GO HY KR LZ MX NW QT SU');
    PLUGBOARD = new Plugboard('');
    MACHINE = new Machine(REFLECTORS['B'], WHEELS[1], WHEELS[2], WHEELS[3], PLUGBOARD);
}


function showError(message) {
    var time = new Date().getTime();
    var html = '<div class="alert alert-danger alert-dismissable errorMessage'
            + time + '">'
            + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
            + '<strong>Error ! </strong> '
            + message + '</div>';
    $('#errorMessage').html(html);
    setTimeout(function() {
        $('.errorMessage' + time).remove();
    }, 3000);
}

function createButtons() {
    var firstRowButtons = new Array('Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O');
    var secondRowButtons = new Array('A', 'S', 'D', 'F', 'G', 'H', 'J', 'K');
    var thirdRowButtons = new Array('P', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'L');
    firstRowButtons.forEach(function(char) {
        $('#inputFirstRow').append('<input class="button keyboardButton" id="inputButton' + char + '" type="button" value="' + char + '">');
        $('#outputFirstRow').append('<input class="button" id="lampButton' + char + '" type="button" value="' + char + '" disabled>');
    });
    secondRowButtons.forEach(function(char) {
        $('#inputSecondRow').append('<input class="button keyboardButton" id="inputButton' + char + '" type="button" value="' + char + '">');
        $('#outputSecondRow').append('<input class="button" id="lampButton' + char + '" type="button" value="' + char + '" disabled>');
    });
    thirdRowButtons.forEach(function(char) {
        $('#inputThirdRow').append('<input class="button keyboardButton" id="inputButton' + char + '" type="button" value="' + char + '">');
        $('#outputThirdRow').append('<input class="button" id="lampButton' + char + '" type="button" value="' + char + '" disabled>');
    });
    resizeButtons();
    catchClickedButton();
}

function resetMachine() {
    MACHINE.resetWheels();
    $('#inputTextField').html('');
    $('#outputTextField').html('');
    setWheelCurrentPositions();
}


function setSelectedWheels() {
    //remove active & disabled in every wheel
    $('.selectWheel a').each(function(e) {
        $(this).parent().removeClass('disabled active');
    });
    //set active wheel
    $('#wheelLeftSet .wheel' + MACHINE.wheelLeft.name).addClass('active');
    $('#wheelCenterSet .wheel' + MACHINE.wheelCenter.name).addClass('active');
    $('#wheelRightSet .wheel' + MACHINE.wheelRight.name).addClass('active');
    //set disabled wheels
    $('#wheelLeftSet .wheel' + MACHINE.wheelCenter.name).addClass('disabled');
    $('#wheelLeftSet .wheel' + MACHINE.wheelRight.name).addClass('disabled');
    $('#wheelCenterSet .wheel' + MACHINE.wheelLeft.name).addClass('disabled');
    $('#wheelCenterSet .wheel' + MACHINE.wheelRight.name).addClass('disabled');
    $('#wheelRightSet .wheel' + MACHINE.wheelLeft.name).addClass('disabled');
    $('#wheelRightSet .wheel' + MACHINE.wheelCenter.name).addClass('disabled');
    setWheelStartPositions();
    $('.selectWheel .reflector' + MACHINE.reflector.name).addClass('active');
}

function setWheelStartPositions() {
    var wheels = new Array('wheelLeft', 'wheelCenter', 'wheelRight');
    wheels.forEach(function(wheel) {
        $('#' + wheel + 'Set .startPosition a').html(MACHINE[wheel].startPosition);
        setWheelCurrentPositions();
    });
}

function setWheelCurrentPositions() {
    var wheels = new Array('wheelLeft', 'wheelCenter', 'wheelRight');
    wheels.forEach(function(wheel) {
        $('#' + wheel + 'Set .currentPosition a').html(MACHINE[wheel].position);
    });
}