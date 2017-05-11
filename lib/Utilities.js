const shortid = require('shortid');

export const uniqueId = () => {
  return shortid.generate();
};

export const isEmptyLink = (link) => {
  if (link && link.trim() !== '') {
    return false;
  }
  return true;
};

export const beautifulFormat = (url) => {
  if(isEmptyLink(url))
    return '';
  url = url.replace(/http:\/\//g, "");
  url = url.replace(/https:\/\//g, "");
  return url;
};

export const getDomain = (url) => {
  try {
    url = exports.beautifulFormat(url);
    var urls = url.split('/');
    return urls[0];
  } catch(e) {
    return url;
  }
};

export const extractDomain = (url) => {
  if(isEmptyLink(url))
    return null;

  // check protocol
  let protocol = null;
  if (url.indexOf('https') > -1) protocol = 'https';
  else if (url.indexOf('http') > -1) protocol = 'http';
  if(!protocol) return null;

  const domain = getDomain(url);
  const baseUrl = `${protocol}://${domain}`;

  const uri = url.substring(baseUrl.length);
  return {
    baseUrl,
    uri,
  };
};
