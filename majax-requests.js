// Quick and dirty solution. errors are not properly handled.
'use-strict';

/**
 * Make a multiple ajax request and get a single response back
 * if all requests are completely sucessful.
 * 
 * @class MultipleAjaxRequests
 * @param {Array} urls
 * @param {?node} node. Node that will be listing to the `allResolved` event 
 * @param {Object} headers, e.g. {"Authorization": "Basic XXX"}
 * @param {Boolean} bubbles, if true, events will bubble to ancestors of the 
 *         element which fired the event. Default to true.
 * @param {Boolean} cancelable, : if true, events can be canceled using 
 *        the event object’s stopPropagation() method. Default to true.
 */
class MultipleAjaxRequests
{

    /**
     * Creates an instance of MultipleAjaxRequests.
     * @param {any} urls 
     * @param {any} node 
     * @param {any} headers 
     * @param {any} bubbles 
     * @param {any} cancelable 
     * @memberof MultipleAjaxRequests
     */
    constructor(urls, node, headers, bubbles, cancelable)
    {
        this._urls = urls;
        this._responseObject = [];
        this.isResolved = false;

        /**
         * @event allResolved
         * This will be fire when all request have been processed
         */
        this.allResolvedEvent = new CustomEvent('allResolved', {
            bubbles: this.constructor._getBoolean(bubbles),
            cancelable: this.constructor._getBoolean(cancelable),
            detail: this._responseObject,
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
        const promiseResponses = this._urls.map(
            async (url) => {
                const x = await this._singleAjaxCall(url);
                return x;
            }
        );
        for (const r of promiseResponses) {
            this._responseObject.push(await r);
        }
        if (this._responseObject.length === this._urls.length){
            this.node.dispatchEvent(this.allResolvedEvent);
        }
    }

    /**
     * 
     * @private
     * @param {String} url 
     * @return {Object} Promise
     * @memberOf MultipleAjaxRequests
     */
    _singleAjaxCall(url)
    {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);

            xhr.onload = function() {
                if (xhr.status >= 200 || xhr.status < 500) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(Error(xhr.statusText));
                }
            };
            xhr.onerror = function() {
                reject(Error('Network Error'));
            };

            for (const key in this._headers) {
                if (Object.prototype.hasOwnProperty.call(this._headers, key)) {
                    xhr.setRequestHeader(key, this._headers[key]);
                }
            }
            xhr.send();
        });
    }

    /**
     * 
     * @readonly
     * @memberOf MultipleAjaxRequests
     */
    get response()
    {
        return this._responseObject;
    }

    /**
     * 
     * 
     * @param {Boolan} value
     * @return {Boolean}
     * @memberof MultipleAjaxRequests
     */
    static _getBoolean(value)
    {
        return typeof value === "undefined" ? true: value;
    }
}