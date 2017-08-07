//quick and dirty solution. errors are not properly handled.
'use strict';
/**
 * Make a multiple ajax request and get a single response back
 * if all requests are completely sucessful.
 * 
 * @class MultipleAjaxRequests
 * @param {Array} urls
 * @param {?node} node. Node that will be listing to the `allResolved` event 
 * @param {Object} headers, e.g. {"Authorization": "Basic XXX"}
 */
class MultipleAjaxRequests
{
    constructor (urls, node, headers)
    {
        this._urls = urls;
        this._responseObject = [];
        this.isResolved = false;
        /**
         * @event allResolved
         * This will be fire when all request have been processed
         */
        this.allResolvedEvent = new CustomEvent("allResolved", {
            "detail": this._responseObject
        });

        this.node = node;
        this._headers = headers;
    }
    /**
     * 
     * @memberOf MultipleAjaxRequests
     */
    async send()
    {
        const textPromises = this._urls.map(async url => {
            return await this._singleAjaxCall(url);
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
            xhr.open("GET", url);

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

            let key;
            for (key in this._headers) {
                xhr.setRequestHeader(key, this._headers[key]);
            }
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