export function pfunctionColorClass(gapi) {
  let colorClass = '';
  if (gapi.type === 'event') {
    colorClass = 'event';
  } else if (gapi.payable) {
    colorClass = 'payable';
  } else if (!gapi.constant) {
    colorClass = 'nonconstant';
  }
  return colorClass;
}

export const JsonArrayToString = function (json) {
  let functionArgs = JSON.stringify(json);
  functionArgs = functionArgs.substring(
    1,
    functionArgs.length - 1,
  ).replace(/\\"/g, '"');
  return functionArgs;
};

export const validateArg = (value, type, components=[], self) => {
  if (type.indexOf('int') > -1) {
    value = parseInt(value);
    if (value === NaN) {
      this.errorMessages.push(`Argument number ${i} should be ${input.type}`);
      if (self) {
        self.errorMessages = this.errorMessages;
      }
    }
    return value;
  }

  if (type === 'tuple') {
    components.forEach((comp) => {
      if (value[comp.name] === undefined) {
        this.errorMessages.push(`Missing field: ${comp.name}`);
      }
    });
    try {
      JSON.stringify(value);
    } catch (e) {
      this.errorMessages.push(`Value does not have a valid JSON format`);
    }
    if (self) {
      self.errorMessages = this.errorMessages;
    }
  }
  return value;
};
