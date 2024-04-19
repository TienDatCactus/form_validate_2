function validator(formSelector) {
  // call this from out side declared fnction
  var _this = this;
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var formRules = {
    // name: "required",
    // email: "required|email",
    // password: "required|min:6"
  };

  /* Creating rules basis */
  // - if theres errors , return `error message`
  // - if none , return undefined
  var validatorRules = {
    required: function (value) {
      return value ? undefined : "Please enter a valid information";
    },
    email: function (value) {
      var regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      return regex.test(value)
        ? undefined
        : "Please enter your Email correctly !";
    },
    min: function (min) {
      return function (value) {
        return value.length >= min
          ? undefined
          : `Please enter a minimum length of ${min}`;
      };
    },
    max: function (max) {
      return value.length <= max
        ? undefined
        : `Please enter a minimum length of ${max}`;
    },
  };
  //takes out form from DOM followed by selector
  var form = document.querySelector(formSelector);

  //process on form validation
  if (form) {
    var inputElements = form.querySelectorAll("[name][rules]");
    Array.from(inputElements).forEach(function () {});
    for (var input of inputElements) {
      var rules = input.getAttribute("rules").split("|");
      for (var rule of rules) {
        var ruleHasValue = rule.includes(":");
        var ruleParam;
        if (ruleHasValue) {
          ruleParam = rule.split(":");
          rule = ruleParam[0];
        }
        var ruleFunction = validatorRules[rule];
        if (ruleHasValue) {
          ruleFunction = ruleFunction(ruleParam[1]);
        }
        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunction);
        } else {
          formRules[input.name] = [ruleFunction];
        }
      }
      input.onblur = handleValidation;
      input.oninput = clearError;
    }

    function handleValidation(event) {
      var rules = formRules[event.target.name];
      var errors;

      for (var rule of rules) {
        errors = rule(event.target.value);
        if (errors) break;
      }

      if (errors) {
        var errorParent = getParent(event.target, ".input");
        if (errorParent) {
          var message = errorParent.querySelector(".form-msg");
          if (message) {
            errorParent.classList.add("invalid");
            message.innerText = errors;
          }
        }
      }
      return !errors;
    }

    function clearError(event) {
      var errorParent = getParent(event.target, ".input");
      if (errorParent.classList.contains("invalid")) {
        errorParent.classList.remove("invalid");
        var message = errorParent.querySelector(".form-msg");
        if (message) {
          message.innerText = "";
        }
      }
    }
  }

  form.onsubmit = function (event) {
    event.preventDefault();

    var formValid = true;
    var inputElements = form.querySelectorAll("[name][rules]");
    for (var input of inputElements) {
      if (
        !handleValidation({
          target: input,
        })
      ) {
        formValid = false;
      }
    }

    if (formValid) {
      if (typeof _this.onSubmit === "function") {
        var formData = form.querySelectorAll("[name]");
        var formValue = Array.from(formData).reduce(function (values, input) {
          switch (input.type) {
            case "file":
              getParent(input, _this.inputSelector).querySelector(
                _this.customElements
              ).innerHTML = "Your file is here !";
              values[input.name] = input.files;
              break;
            case "checkbox":
              if (input.matches(":checked")) return values;

              if (!Array.isArray(values[input.name])) {
                values[input.name] = [];
              }
              values[input.name].push();
              break;
            case "radio":
              values[input.name] = form.querySelector(
                'input[type="' + input.type + '"]:checked'
              ).value;
              break;
            default:
              values[input.name] = input.value;
          }
          return values;
        }, {});
        _this.onSubmit(formValue);
      } // submit with default event
      else {
        form.submit();
      }
    }
  };
}
