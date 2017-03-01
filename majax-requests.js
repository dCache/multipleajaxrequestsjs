//quick and dirty solution. errors are not properly handled.
'use strict';
/**
 * Make a multiple ajax request and get a single response back
 * if all requests are completely sucessful.
 * 
 * @class MultipleAjaxRequests
 * @param {Array} urls
 * @param {String} credential
 * @param {?node} node 
 */
class MultipleAjaxRequests
{
    constructor (urls, credential, node)
    {
        this._urls = urls;
        this._credential = credential;
        this._responseObject = [];
        this.isResolved = false;
        this.allResolvedEvent = new CustomEvent('allResolved', {
            'detail': this._responseObject
        });
        this.node = node;
    }
    /**
     * 
     * @memberOf MultipleAjaxRequests
     */
    async send()
    {
        const textPromises = this._urls.map(async url => {
            const response = await this._singleAjaxCall(url);
            return response;
        });

        for (const textPromise of textPromises) {
            this._responseObject.push(await textPromise);
        }
        if (this._responseObject.length == this._urls.length)
            this.node.dispatchEvent(this.allResolvedEvent);
    }

    /**
     * 
     * @private
     * @param {String} url 
     * @returns {Object} Promise
     * 
     * @memberOf MultipleAjaxRequests
     */
    _singleAjaxCall (url)
    {
        return new Promise( (resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url);

            xhr.onload = function() {
                if (xhr.status >= 200 || xhr.status < 500) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(Error(xhr.statusText));
                }
            };
            xhr.onerror = function() {
                reject(Error("Network Error"));
            };

            xhr.setRequestHeader("Content-type", "application/json");
            xhr.setRequestHeader("Authorization", this._credential);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.send();
        });
    }

    /**
     * 
     * @readonly
     * 
     * @memberOf MultipleAjaxRequests
     */
    get response()
    {
        return this._responseObject;
    }
}