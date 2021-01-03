var numeralSystems = [
    {base: 2, name : "Sistema Binario", regExp : /[0-1]/},
    {base: 8, name : "Sistema Octal", regExp : /[0-7]/},
    {base: 10, name : "Sistema Decimal", regExp : /[0-9]/},
    {base: 11, name : "Sistema Undecimal", regExp : /[0-9A]/},
    {base: 16, name : "Sistema Hexadecimal", regExp : /[0-9A-F]/i}
    ];

function load(){
    var main = document.createElement("main");
    document.getElementById("body").appendChild(main);
    for(numeralSystem of numeralSystems){
        var fieldset = document.createElement("fieldset");
        main.appendChild(fieldset);
        var legend = document.createElement("legend");
        fieldset.appendChild(legend);
        var h3 = document.createElement("h3");
        legend.appendChild(h3);
        h3.appendChild(document.createTextNode(numeralSystem.name));
        var label = document.createElement("label");
        fieldset.appendChild(label);
        label.appendChild(document.createTextNode("Valor: "));
        var input = document.createElement("input");
        fieldset.appendChild(input);
        numeralSystem.input = input;
        input.numeralSystem = numeralSystem;
        input.setAttribute("type", "text");
        input.setAttribute("onkeypress", "filter(event,"+numeralSystem.regExp+");")
        input.setAttribute("onchange","refresh(this);");
        var button = document.createElement("input");
        fieldset.appendChild(button);
        button.setAttribute("type","button");
        button.setAttribute("value","Convertir");
        numeralSystem.developmentSpan = [];
        for(var i=0; i<4; i++){
            var developmentSpan = document.createElement("span");
            fieldset.appendChild(developmentSpan);
            developmentSpan.innerHTML = "&nbsp;";
            developmentSpan.setAttribute("class", "development");
            numeralSystem.developmentSpan[i] = developmentSpan;
        }
        numeralSystem.div = generateDivisions(10);                   
        fieldset.appendChild(numeralSystem.div);
    }
}

function refresh(input){
    var value = parseInt(input.value, input.numeralSystem.base);
    for(numeralSystem of numeralSystems){
        numeralSystem.input.value = 
            decimalToDigits(value, numeralSystem.base);
        development(                      
            digitsToDecimal(
                decimalToDigits(value,numeralSystem.base), numeralSystem.base),
                numeralSystem.developmentSpan);
        limpia(numeralSystem.div);
        trace(
            decimalToDigits(value, numeralSystem.base, true),
            numeralSystem.div);
    }       
}

function development(steps, spans){
    var html = "";
    for(step of steps){
        html += (step.coeficient>=0?"+&nbsp;":"")+ step.coeficient + "·" + 
            step.base + "<sup>" + step.exponent + "</sup> ";
    }
    spans[0].innerHTML = html;
    var html = "";
    for(step of steps){
        html += (step.coeficient>=0?"+&nbsp;":"")+ step.coeficient + "·" + 
            step.base ** step.exponent;
    }
    spans[1].innerHTML = html;
    var html = "";
    for(step of steps){
        html += (step.coeficient>=0?"+&nbsp;":"")+ step.coeficient * step.base ** step.exponent;
    }
    spans[2].innerHTML = html;
    var acum = 0;
    for(step of steps){
        acum += step.coeficient * step.base ** step.exponent;
    }
    spans[3].innerHTML = acum;
}

function limpia(div){
    div.childNodes[0].innerHTML = "";
    div.childNodes[1].innerHTML = "";
    div.childNodes[2].innerHTML = "";
    div.childNodes[2].style.visibility = "hidden";
    if (div.childNodes[3] != undefined) { 
        limpia(div.childNodes[3]);
    }
}

function trace(steps, div){
    var [step, ...rest] = steps;
    div.childNodes[1].innerHTML = step.dividend;
    div.childNodes[2].innerHTML = step.divisor;
    div.childNodes[2].style.visibility = "visible";
    div.childNodes[3].childNodes[0].innerHTML = step.remainder; 
    div.childNodes[3].childNodes[1].innerHTML = step.quotient; 
    if (rest.length != 0) {
        trace(rest, div.childNodes[3]);
    }
}
    
function generateDivisions(times){
    var div = document.createElement("div");
    var remainderSpan = document.createElement("span");
    div.appendChild(remainderSpan);
    remainderSpan.setAttribute("class","remainder");
    var dividendSpan = document.createElement("span");
    div.appendChild(dividendSpan);
    dividendSpan.setAttribute("class","dividend");
    var divisorSpan = document.createElement("span");
    div.appendChild(divisorSpan);
    divisorSpan.setAttribute("class","divisor");
    if (times>1) {
        div.appendChild(generateDivisions(times-1))
    }
    return div;
}

function filter(event, regexp){
    if (!regexp.test(event.key)){
        event.preventDefault();
    }
}

function decimalToDigits(value, base, trace){
    function getStep(dividend, divisor){
        return {
            dividend : dividend,
            divisor : divisor,
            quotient : Math.trunc(dividend/divisor),
            remainder : dividend%divisor 
        }
    }
    var steps = [getStep(value, base)];
    while (steps[steps.length-1].quotient >= base){
        steps.push(getStep(steps[steps.length-1].quotient, base));
    }
    if (trace){
        return steps;
    }
    var result = "";
    var quotient = steps[steps.length-1].quotient;
    if (quotient != 0){
        result += decimalToDigit(quotient);
    }
    for(var i=steps.length-1; i>=0; i--){
        result += decimalToDigit(steps[i].remainder);
    }
    return result;
}

function decimalToDigit(value){
    if (value<10) {
        return ""+value;
    } else {
        return ["A", "B", "C", "D", "E", "F"][value-10];
    }
}

function digitsToDecimal(text, base){
    var steps = [];
    for(var i=0; i<text.length; i++) {
        var step = {};
        step.coeficient = digitToDecimal(text[i]);
        step.base = base;
        step.exponent = text.length-1-i;
        steps.push(step);
    }
    return steps;
}

function digitToDecimal(char){
    var ranges = [
            { regExp : /[0-9]/g, baseChar : "0", shift : 0 },
            { regExp : /[A-F]/g, baseChar : "A", shift : 10 },
            { regExp : /[a-f]/g, baseChar : "a", shift : 10 },
        ];
    var i=0;
    while (!ranges[i].regExp.test(char)){
        i++;
    }
    return char.charCodeAt(0) - 
        ranges[i].baseChar.charCodeAt(0) + 
        ranges[i].shift;
}