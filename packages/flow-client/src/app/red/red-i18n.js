import i18next from 'i18next';
import jqueryI18next from 'jquery-i18next';

import localesEnEditor from './red-locales-en-us-editor';
import localesEnNodes from './red-locales-en-us-nodes';

/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

export const createRedI18n = (RED, $) => {
    var apiRootUrl;

    function detectLanguage() {
        return navigator.language;
    }

    return {
        init: function () {
            var preferredLanguage =
                localStorage.getItem('editor-language') || detectLanguage();
            var opts = {
                compatibilityJSON: 'v3',
                lng: 'en-US',
                // debug: true,
                resources: {
                    en: {
                        editor: localesEnEditor,
                        'node-red': localesEnNodes,
                    },
                },
                preload: ['en-US'],
                ns: ['editor', 'node-red', 'jsonata', 'infotips'],
                defaultNS: 'editor',
                fallbackLng: ['en-US'],
                returnObjects: true,
                keySeparator: '.',
                nsSeparator: ':',
                interpolation: {
                    unescapeSuffix: 'HTML',
                    escapeValue: false,
                    prefix: '__',
                    suffix: '__',
                },
            };
            if (preferredLanguage) {
                opts.lng = preferredLanguage;
            }

            i18next.init(opts);
            jqueryI18next.init(i18next, $, { handleName: 'i18n' });
        },
        _: (...args) => {
            var v = i18next.t.apply(i18next, args);
            if (typeof v === 'string') {
                return v;
            } else {
                return args[0];
            }
        },
        lang: function () {
            // Gets the active message catalog language. This is based on what
            // locale the editor is using and what languages are available.
            //
            var preferredLangs = [
                localStorage.getItem('editor-language') || detectLanguage(),
            ].concat(i18next.languages);
            var knownLangs = RED.settings.theme('languages') || ['en-US'];
            for (var i = 0; i < preferredLangs.length; i++) {
                if (knownLangs.indexOf(preferredLangs[i]) > -1) {
                    return preferredLangs[i];
                }
            }
            return 'en-US';
        },
        loadNodeCatalog: function (namespace, done) {
            var languageList = [
                localStorage.getItem('editor-language') || detectLanguage(),
            ].concat(i18next.languages);
            var toLoad = languageList.length;
            languageList.forEach(function (lang) {
                $.ajax({
                    headers: {
                        Accept: 'application/json',
                    },
                    cache: false,
                    url:
                        apiRootUrl +
                        'nodes/' +
                        namespace +
                        '/messages?lng=' +
                        lang,
                    success: function (data) {
                        i18next.addResourceBundle(lang, namespace, data);
                        toLoad--;
                        if (toLoad === 0) {
                            done();
                        }
                    },
                });
            });
        },

        loadNodeCatalogs: function (done) {
            var languageList = [
                localStorage.getItem('editor-language') || detectLanguage(),
            ].concat(i18next.languages);
            var toLoad = languageList.length;

            languageList.forEach(function (lang) {
                $.ajax({
                    headers: {
                        Accept: 'application/json',
                    },
                    cache: false,
                    url: apiRootUrl + 'nodes/messages?lng=' + lang,
                    success: function (data) {
                        var namespaces = Object.keys(data);
                        namespaces.forEach(function (ns) {
                            i18next.addResourceBundle(lang, ns, data[ns]);
                        });
                        toLoad--;
                        if (toLoad === 0) {
                            done();
                        }
                    },
                });
            });
        },

        loadPluginCatalogs: function (done) {
            var languageList = [
                localStorage.getItem('editor-language') || detectLanguage(),
            ].concat(i18next.languages);
            var toLoad = languageList.length;

            languageList.forEach(function (lang) {
                $.ajax({
                    headers: {
                        Accept: 'application/json',
                    },
                    cache: false,
                    url: apiRootUrl + 'plugins/messages?lng=' + lang,
                    success: function (data) {
                        var namespaces = Object.keys(data);
                        namespaces.forEach(function (ns) {
                            i18next.addResourceBundle(lang, ns, data[ns]);
                        });
                        toLoad--;
                        if (toLoad === 0) {
                            done();
                        }
                    },
                });
            });
        },
        detectLanguage: detectLanguage,
    };
};
