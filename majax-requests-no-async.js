// Quick and dirty solution. errors are not properly handled.
/**
 * Make a multiple ajax request and get a single response back
 * if all requests are completely sucessful.
 * 
 * @class MultipleAjaxRequests
 * @param {Array} urls
 * @param {?node} node. Node that will be listing to the `allResolved` event 
 * @param {Object} headers, e.g. {"Authorization": "Basic XXX"}
 */
class MultipleAjaxRequests {

    /**
     * Creates an instance of MultipleAjaxRequests.
     * @param {any} urls 
     * @param {any} node 
     * @param {any} headers 
     * @memberof MultipleAjaxRequests
     */
    constructor(urls, node, headers) {
        this._urls = urls;
        this._responseObject = [];
        this.allResolvedEvent = new CustomEvent('allResolved', {detail: {response: this._responseObject}});
        this._node = node;
        this._headers = headers;
    }

    /**
     * 
     * @memberOf MultipleAjaxRequests
     */
    send() {
        const textPromises = this._urls.map((url) => this._singleAjaxCall(url).then((response) => response));
        textPromises.reduce((chain, textPromise) => chain.then(() => textPromise).
            then((text) => {
                this._responseObject.push(text);
                if (this._responseObject.length === this._urls.length) {
                    this._node.dispatchEvent(this.allResolvedEvent);
                }
            }), Promise.resolve());
    }

    /**
     * 
     * @private
     * @param {String} url 
     * @return {Object} Promise
     * @memberOf MultipleAjaxRequests
     */
    _singleAjaxCall(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onload = function() {
                if (xhr.status >= 200 || xhr.status < 500) {
                    resolve(JSON.parse(xhr.responseText));
                }
                else {
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
    }
}