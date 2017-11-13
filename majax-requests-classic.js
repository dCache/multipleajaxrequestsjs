// Quick and dirty solution. errors are not properly handled.


/**
 * For polymer version 1.0.0
 * 
 * @class MultipleAjaxRequests
 * 
 * @constructor
 * @param {array} urls
 * @param {string} credential
 * @param {!node} node
 * @param {Object} headers
 */
const MultipleAjaxRequests = function (urls, credential, node, headers)
{
    this._urls = urls;
    this._credential = credential;
    this._responseObject = [];
    this.allResolvedEvent = new CustomEvent('allResolved', {'detail': this._responseObject});
    this._node = node;
    this._headers = headers;
};
MultipleAjaxRequests.prototype.send = function()
{
    const textPromises = this._urls.map((url) => this._singleAjaxCall(url).then((response) => response));
    textPromises.reduce((chain, textPromise) => chain.then(() => textPromise).
            then((text) => {
                this._responseObject.push(text);
                if (this._responseObject.length === this._urls.length) {
                    this._node.dispatchEvent(this.allResolvedEvent);
                }
            }), Promise.resolve());
};
MultipleAjaxRequests.prototype._singleAjaxCall = function(url)
{
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);

        xhr.onload = function() {
            if (xhr.status >= 200 || xhr.status < 500) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(Error("Server Side Error"));
            }
        };
        xhr.onerror = function() {
            reject(Error("Network Error"));
        };

        for (const key in this._headers) {
            if (Object.prototype.hasOwnProperty.call(this._headers, key)) {
                xhr.setRequestHeader(key, this._headers[key]);
            }
        }

        xhr.send();
    });
};