"use strict";
const modelSelector = document.getElementById("selector");
const nameInput = document.getElementById("name");
const codeInput = document.getElementById("code");
const saveBtn = document.getElementById("save");
const nameError = document.getElementById("nameError");
const codeError = document.getElementById("codeError");
const colorsContainer = document.getElementById("color-display");
var ColorModel;
(function (ColorModel) {
    ColorModel["RGB"] = "RGB";
    ColorModel["RGBA"] = "RGBA";
    ColorModel["HEX"] = "HEX";
})(ColorModel || (ColorModel = {}));
class Color {
    constructor(name, code, model) {
        this.name = name;
        this.code = code;
        if (typeof model == "string") {
            switch (model.toUpperCase()) {
                case "RGB":
                    this.model = ColorModel.RGB;
                    break;
                case "RGBA":
                    this.model = ColorModel.RGBA;
                    break;
                case "HEX":
                    this.model = ColorModel.HEX;
                    break;
            }
        }
        else {
            this.model = model;
        }
    }
    toCSS() {
        if (this.model == ColorModel.RGB) {
            return `rgb(${this.code})`;
        }
        if (this.model == ColorModel.RGBA) {
            return `rgba(${this.code})`;
        }
        if (this.model == ColorModel.HEX) {
            return this.code;
        }
    }
}
const colors = [];
const storedColors = JSON.parse(localStorage.getItem("colors"));
if (storedColors) {
    for (const obj of storedColors) {
        colors.push(new Color(obj.name, obj.code, obj.model));
    }
}
colors.forEach(color => displayColor(color));
function checkCodeValid(colorCode, colorModel) {
    if (colorModel == ColorModel.RGB) {
        const numericValues = [];
        colorCode.split(',').forEach(value => numericValues.push(Number(value)));
        if (numericValues.length != 3) {
            displayCodeError("Must contain 3 values");
            return false;
        }
        for (const value of numericValues) {
            if (value < 0 || value > 255) {
                displayCodeError("Values must be in range 0-255");
                return false;
            }
        }
    }
    if (colorModel == ColorModel.RGBA) {
        const numericValues = [];
        colorCode.split(',').forEach(value => numericValues.push(Number(value)));
        if (numericValues.length != 4) {
            displayCodeError("Must contain 4 values");
            return false;
        }
        for (let i = 0; i < numericValues.length; i++) {
            if ((i < 3) && (numericValues[i] < 0 || numericValues[i] > 255)) {
                displayCodeError("RGB values must be in range 0-255");
                return false;
            }
            if ((i == 3) && (numericValues[i] < 0 || numericValues[i] > 1)) {
                displayCodeError("Alpha channel value must be in range 0-1");
                return false;
            }
        }
    }
    if (colorModel == ColorModel.HEX) {
        if (colorCode.charAt(0) !== '#') {
            displayCodeError("Must start with '#'");
            return false;
        }
        if (colorCode.length != 7) {
            displayCodeError("Must contain 6 letters");
            return false;
        }
        const numericValues = [
            Number("0x" + colorCode.slice(1, 3)),
            Number("0x" + colorCode.slice(3, 5)),
            Number("0x" + colorCode.slice(5)),
        ];
        for (const value of numericValues) {
            if (value < 0 || value > 255 || Number.isNaN(value)) {
                displayCodeError("Values must be in range 00 - ff");
                return false;
            }
        }
    }
    codeError.innerHTML = "";
    return true;
}
function checkNameValid(name) {
    name = name.toLowerCase();
    if (name.length == 0) {
        displayNameError("Can't be empty");
        return false;
    }
    if (!name.match("^[a-z]+$")) {
        displayNameError("Must only contain letters");
        return false;
    }
    for (const color of colors) {
        if (name == color.name.toLowerCase()) {
            displayNameError("Must be unique");
            return false;
        }
    }
    nameError.innerHTML = "";
    return true;
}
function displayCodeError(message) {
    codeError.innerHTML = `
        <span style="color: red;" class="form-text">
            Invalid code. ${message}
        </span>
    `;
}
function displayNameError(message) {
    nameError.innerHTML = `
        <span style="color: red;" class="form-text">
            Invalid name. ${message}
        </span>
    `;
}
saveBtn.addEventListener("click", onSave);
function onSave(event) {
    event.preventDefault();
    const name = nameInput.value;
    const colorCode = codeInput.value;
    let colorModel;
    switch (modelSelector.value.toUpperCase()) {
        case "RGB":
            colorModel = ColorModel.RGB;
            break;
        case "RGBA":
            colorModel = ColorModel.RGBA;
            break;
        case "HEX":
            colorModel = ColorModel.HEX;
            break;
        default:
            colorModel = ColorModel.RGBA;
    }
    if (checkCodeValid(colorCode, colorModel) && checkNameValid(name)) {
        const color = new Color(name, colorCode, colorModel);
        colors.push(color);
        localStorage.setItem("colors", JSON.stringify(colors));
        displayColor(color);
    }
}
function displayColor(color) {
    colorsContainer.insertAdjacentElement("beforeend", getColorElement(color));
}
function getColorElement(color) {
    const colorBox = document.createElement("div");
    colorBox.classList.add("col", "colorBox");
    colorBox.style.backgroundColor = color.toCSS();
    const colorInfo = document.createElement("div");
    colorInfo.classList.add("colorInfo", "text-center");
    colorInfo.innerHTML = `
        <h4>${color.name.toUpperCase()}</h4>
        <h5>${color.model}</h5>
        <p>${color.code.toUpperCase()}</p>
    `;
    colorBox.appendChild(colorInfo);
    return colorBox;
}
