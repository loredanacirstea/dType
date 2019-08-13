export const getAliasesFromMd = (text) => {
  const included = {aliases: [], full: []};
  const links = {aliases: [], full: []};
  const arrayMatch = [...text.matchAll(/\[\[(.*?)\]\]/g)];

  arrayMatch.forEach((match) => {
    const endindex = match.index + match[0].length;
    if (text.substring(endindex, endindex + 2) === '()') {
      links.aliases.push(match[1]);
      links.full.push(`${match[0]}()`);
    } else {
      included.aliases.push(match[1]);
      included.full.push(match[0]);
    }
  });
  return {included, links};
};

export const replaceAliases = (text, aliases, replacements) => {
  aliases.forEach((match, i) => {
    text = text.replace(match, replacements[i]);
  });
  return text;
};

export const TYPE_PREVIEW = {
  markdown: (data) => {
    // return ethers.utils.toUtf8String(data.content);
    return data.content;
  },
  account: (data) => {
    return `\`${data.addr}\``;
  },
  person: (data) => {
    return data.fullname;
  },
  PhysicalAddress: (data) => {
    return Object.values(data).join(', ');
  },
};

export const typePreview = (dtypeName, data, alias) => {
  // console.log('typePreview', dtypeName, data, alias);
  if (!data) return '';
  // if (TYPE_PREVIEW[dtypeName]) {
  //   return TYPE_PREVIEW[dtypeName](data);
  // }
  return `<span>${data}</span>` + aliasBtns(alias);
};

export const enforceMaxLength = (cm, change) => {
  const maxLength = cm.getOption('maxLength');

  if (maxLength && change.update) {
    let str = change.text.join('\n');
    let delta = str.length - (cm.indexFromPos(change.to) - cm.indexFromPos(change.from));
    if (delta <= 0) { return true; }
    delta = cm.getValue().length + delta - maxLength;
    if (delta > 0) {
      str = str.substr(0, str.length - delta);
      change.update(change.from, change.to, str.split('\n'));
    }
  }
  return true;
};

export const previewRender = async (html, replaceAlias) => {
  const {included, links} = getAliasesFromMd(html);
  // console.log('previewRender included, links', included, links);
  // Replace links before included aliases
  // console.log(included, links, links.aliases.map(link => `<a href="/#/alias?alias=${link}">${link}</a>` + aliasBtns(link)));
  html = replaceAliases(
    html,
    links.full,
    links.aliases.map(link => `<a href="/#/alias?alias=${link}">${link}</a>` + aliasBtns(link)),
  );
  const aliasobjs = await replaceAlias(included.aliases);
  html = replaceAliases(html, included.full, aliasobjs);

  return html;
};

export const aliasBtns = (alias) => {
  // return `
  //   <button>Edit</button>
  // `
  // console.log('aliasBtns', alias);
  // return `<button type="button" class="v-btn v-btn--icon theme--light v-size--small" onClick='updateTypeData("${alias}")'><div class="v-btn__content"><i aria-hidden="true" class="v-icon v-icon--link fa fa-edit theme--light"></i></div></button>`;

  return `<button type="button" onClick='updateTypeData("${alias}")' style="padding-right: 5px;padding-left: 5px;"><i aria-hidden="true" class="v-icon v-icon--link fa fa-edit theme--light" style="font-size: 15px;padding-bottom: 5px;"></i></button>`;
};
