export type JqueryContext = Element | Document | ShadowRoot;

export const createMockJquery = () => {
    type InnerContext = JqueryContext | Record<string, unknown> | jQuery;

    class jQuery {
        private elements: Element[];
        private previousContext?: jQuery;

        constructor(selector: string, context?: InnerContext);
        constructor(selector: Element);
        constructor(selector: Element[]);
        constructor(selector: jQuery);
        constructor(
            selector: string | Element | Element[] | jQuery,
            context?: InnerContext
        );
        constructor(
            selector: string | Element | Element[] | jQuery,
            context?: InnerContext
        ) {
            if (typeof selector === 'string') {
                // Check if selector is HTML string
                if (
                    selector.trim().startsWith('<') &&
                    selector.trim().endsWith('>')
                ) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = selector;
                    this.elements = Array.from(tempDiv.children);
                    if (
                        context &&
                        !(
                            context instanceof Element ||
                            context instanceof Document ||
                            context instanceof ShadowRoot
                        )
                    ) {
                        this.elements.forEach(element => {
                            Object.entries(context).forEach(([key, value]) => {
                                element.setAttribute(key, value as string);
                            });
                        });
                    } else {
                        const ownerDocument =
                            context instanceof Document ? context : document;
                        this.elements.forEach(element => {
                            ownerDocument.adoptNode(element);
                        });
                    }
                } else if (!context) {
                    this.elements = Array.from(
                        this.querySelectorAll(document, selector)
                    );
                } else if (
                    context instanceof Element ||
                    context instanceof Document ||
                    context instanceof ShadowRoot
                ) {
                    this.elements = Array.from(
                        this.querySelectorAll(context, selector)
                    );
                } else if (context instanceof jQuery) {
                    this.elements = (context as jQuery)
                        .find(selector)
                        .get() as Element[];
                } else if (
                    context &&
                    typeof context === 'object' &&
                    !(context instanceof jQuery) &&
                    !(
                        context instanceof Element ||
                        context instanceof Document ||
                        context instanceof ShadowRoot
                    )
                ) {
                    console.error(`Could not handle given context: `, context);
                    this.elements = []; // No elements in arbitrary object context
                } else if (Array.isArray(context)) {
                    this.elements = context.filter(el => el.matches(selector));
                } else {
                    console.error(`Could not handle given context: `, context);
                    this.elements = [];
                }
            } else if (selector instanceof jQuery) {
                this.elements = selector.elements;
            } else if (selector instanceof Element) {
                this.elements = [selector];
            } else if (
                selector instanceof Document ||
                selector instanceof ShadowRoot
            ) {
                // this will cause various methods to error,
                // hopefully whoever is giving us a document
                // object knows what they're doing
                this.elements = [selector as unknown as Element];
            } else if (Array.isArray(selector)) {
                this.elements = selector;
            } else {
                this.elements = [];
            }
        }

        private newContext(selector: string | Element | Element[]): jQuery {
            const newContext = jQueryFn(selector);
            newContext.previousContext = this;
            return newContext;
        }

        private querySelectorAll(node: JqueryContext, selector: string) {
            if (selector.startsWith('>')) {
                selector = ':scope ' + selector;
            }
            if (selector.includes(':selected')) {
                const selectors = selector.split(',').map(s => s.trim()); // Splitting in case of multiple selectors
                const results = selectors.flatMap(sel => {
                    if (sel.includes(':selected')) {
                        const cleanedSelector = sel.split(':selected')[0]; // Getting the part before :selected
                        const options = node.querySelectorAll(cleanedSelector);
                        return Array.from(options).filter(
                            option =>
                                option instanceof HTMLOptionElement &&
                                option.selected
                        );
                    }
                    return Array.from(node.querySelectorAll(sel));
                });
                return results;
            }
            return node.querySelectorAll(selector);
        }

        private querySelector(node: JqueryContext, selector: string) {
            return this.querySelectorAll(node, selector)[0] ?? null;
        }

        add(selector: string | Element | jQuery): jQuery {
            if (typeof selector === 'string') {
                const newElements = Array.from(
                    this.querySelectorAll(document, selector)
                );
                this.elements = this.elements.concat(newElements);
            } else if (selector instanceof Element) {
                this.elements.push(selector);
            } else if (selector instanceof jQuery) {
                this.elements = this.elements.concat(selector.elements);
            }
            return this;
        }

        addClass(classNames: string): jQuery {
            const classes = classNames.split(' ');
            this.elements
                .filter(el => el instanceof HTMLElement)
                .forEach(element => {
                    classes.forEach(className => {
                        (element as HTMLElement).classList.add(className);
                    });
                });
            return this;
        }

        after(content: string | Element | jQuery): jQuery {
            this.elements.forEach(el => {
                if (typeof content === 'string') {
                    el.insertAdjacentHTML('afterend', content);
                } else if (content instanceof Element) {
                    el.parentNode?.insertBefore(content, el.nextSibling);
                } else if (content instanceof jQuery) {
                    content.elements.forEach(contentEl => {
                        el.parentNode?.insertBefore(contentEl, el.nextSibling);
                    });
                }
            });
            return this;
        }

        animate(): jQuery {
            // Placeholder: Actual animation logic would be complex to implement
            console.warn('animate() not implemented in mock-jQuery.');
            return this;
        }

        append(content: string | Element | jQuery): jQuery {
            this.elements.forEach((el, index) => {
                if (typeof content === 'string') {
                    el.insertAdjacentHTML('beforeend', content);
                } else if (content instanceof Element) {
                    if (index === this.elements.length - 1) {
                        el.appendChild(content);
                    } else {
                        el.appendChild(content.cloneNode(true));
                    }
                } else if (content instanceof jQuery) {
                    content.elements.forEach((contentEl, contentIndex) => {
                        if (contentEl instanceof Node) {
                            if (
                                index === this.elements.length - 1 &&
                                contentIndex === content.elements.length - 1
                            ) {
                                el.appendChild(contentEl);
                            } else {
                                el.appendChild(contentEl.cloneNode(true));
                            }
                        }
                    });
                }
            });
            return this;
        }

        appendTo(target: string | Node | jQuery): jQuery {
            if (typeof target === 'string') {
                const targets = this.querySelectorAll(document, target);
                targets.forEach((t, targetIndex) => {
                    this.elements.forEach((el, elIndex) => {
                        if (el instanceof Node) {
                            if (
                                targetIndex === targets.length - 1 &&
                                elIndex === this.elements.length - 1
                            ) {
                                t.appendChild(el);
                            } else {
                                const clonedNode = el.cloneNode(true);
                                t.appendChild(clonedNode);
                                this.elements.push(clonedNode as Element);
                            }
                        }
                    });
                });
            } else if (target instanceof Node) {
                this.elements.forEach((el, index) => {
                    if (el instanceof Node) {
                        if (index === this.elements.length - 1) {
                            target.appendChild(el);
                        } else {
                            const clonedNode = el.cloneNode(true);
                            target.appendChild(clonedNode);
                            this.elements.push(clonedNode as Element);
                        }
                    }
                });
            } else if (target instanceof jQuery) {
                target.elements.forEach((t, targetIndex) => {
                    this.elements.forEach((el, elIndex) => {
                        if (el instanceof Node) {
                            if (
                                targetIndex === target.elements.length - 1 &&
                                elIndex === this.elements.length - 1
                            ) {
                                t.appendChild(el);
                            } else {
                                const clonedNode = el.cloneNode(true);
                                t.appendChild(clonedNode);
                                this.elements.push(clonedNode as Element);
                            }
                        }
                    });
                });
            }
            return this;
        }

        attr(
            attributeName: string,
            value?: string
        ): jQuery | string | undefined {
            if (value === undefined) {
                // Acting as a getter
                if (this.elements.length > 0) {
                    return (
                        this.elements[0].getAttribute(attributeName) ??
                        undefined
                    );
                }
                return undefined;
            } else {
                // Acting as a setter
                this.elements.forEach(el => {
                    el.setAttribute(attributeName, value);
                });
                return this;
            }
        }

        blur(): jQuery {
            if (this.elements[0] instanceof HTMLElement) {
                this.elements[0].blur();
            }
            return this;
        }

        change(handler?: (this: Element, ev: Event) => unknown): jQuery {
            if (handler) {
                return this.on('change', handler);
            } else {
                return this.trigger('change');
            }
        }

        children(selector?: string): jQuery {
            const filteredChildren = this.elements.flatMap(el =>
                Array.from(
                    selector ? this.querySelectorAll(el, selector) : el.children
                )
            );
            return this.newContext(filteredChildren);
        }

        click(handler?: (this: Element, ev: MouseEvent) => unknown): jQuery {
            if (handler) {
                return this.on(
                    'click',
                    handler as (this: Element, ev: Event) => unknown
                );
            } else {
                return this.trigger('click');
            }
        }

        clone(): jQuery {
            const clonedElements = this.elements.map(el =>
                el.cloneNode(true)
            ) as Element[];
            return this.newContext(clonedElements);
        }
        closest(selector: string | Element | jQuery | string[]): jQuery {
            let elementsToSearch: Element[] = [];
            const searchContext = this.elements[0]?.getRootNode() ?? document;
            if (typeof selector === 'string') {
                elementsToSearch = Array.from(
                    this.querySelectorAll(
                        searchContext as JqueryContext,
                        selector
                    )
                );
            } else if (selector instanceof Element) {
                elementsToSearch = [selector];
            } else if (selector instanceof jQuery) {
                elementsToSearch = selector.elements;
            } else if (Array.isArray(selector)) {
                elementsToSearch = selector.flatMap(sel =>
                    typeof sel === 'string'
                        ? Array.from(
                              this.querySelectorAll(
                                  searchContext as JqueryContext,
                                  sel
                              )
                          )
                        : [sel]
                );
            }

            const closestElements = this.elements
                .map(el => {
                    let parent = el.parentElement;
                    while (parent) {
                        if (elementsToSearch.includes(parent)) {
                            return parent;
                        }
                        parent = parent.parentElement;
                    }
                    return null;
                })
                .filter(el => el !== null) as Element[];

            return this.newContext(closestElements);
        }

        css(
            propertyName: string | string[] | Record<string, string>,
            value?: string
        ): jQuery | string | Record<string, string> | undefined {
            if (typeof propertyName === 'string') {
                if (value === undefined) {
                    // Acting as a getter for a single property
                    if (
                        this.elements.length > 0 &&
                        this.elements[0] instanceof HTMLElement
                    ) {
                        return getComputedStyle(
                            this.elements[0]
                        ).getPropertyValue(propertyName);
                    }
                    return undefined;
                } else {
                    // Acting as a setter for a single property
                    this.elements.forEach(el => {
                        if (el instanceof HTMLElement) {
                            el.style.setProperty(propertyName, value);
                        }
                    });
                    return this;
                }
            } else if (Array.isArray(propertyName)) {
                // Acting as a getter for multiple properties
                const styles: Record<string, string> = {};
                if (
                    this.elements.length > 0 &&
                    this.elements[0] instanceof HTMLElement
                ) {
                    const computedStyle = getComputedStyle(this.elements[0]);
                    propertyName.forEach(prop => {
                        styles[prop] = computedStyle.getPropertyValue(prop);
                    });
                }
                return styles;
            } else {
                // Acting as a setter for multiple properties
                this.elements.forEach(el => {
                    if (el instanceof HTMLElement) {
                        Object.entries(propertyName).forEach(
                            ([prop, value]) => {
                                el.style.setProperty(prop, value);
                            }
                        );
                    }
                });
                return this;
            }
        }

        data<T = unknown>(key: string, value?: T): T | jQuery {
            if (value === undefined) {
                return jQueryFn.data<T>(this.elements[0], key);
            } else {
                // Acting as a setter
                this.elements.forEach(el => {
                    jQueryFn.data(el, key, value);
                });
                return this;
            }
        }

        dblclick(handler?: (this: Element, ev: MouseEvent) => unknown): jQuery {
            if (handler) {
                return this.on(
                    'dblclick',
                    handler as (this: Element, ev: Event) => unknown
                );
            } else {
                return this.trigger('dblclick');
            }
        }

        delay(): jQuery {
            // No-op in this mock context
            return this;
        }

        detach(): jQuery {
            this.elements.forEach(el => {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
            return this;
        }

        each(
            callback: (this: Element, index: number, element: Element) => void
        ): jQuery {
            this.elements.forEach((element, index) => {
                callback.call(element, index, element);
            });
            return this;
        }

        empty(): jQuery {
            this.elements.forEach(el => {
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            });
            return this;
        }

        end(): jQuery {
            return this.previousContext ?? this;
        }

        fadeIn(): jQuery {
            // Similar implementation to slideDown
            return this.slideDown();
        }

        fadeOut(): jQuery {
            // Similar implementation to slideUp
            return this.slideUp();
        }

        fadeToggle(): jQuery {
            // Similar implementation to slideToggle
            return this.slideToggle();
        }

        find(selector: string): jQuery {
            const newElements = this.elements.flatMap(el =>
                Array.from(this.querySelectorAll(el, selector))
            );
            return this.newContext(newElements);
        }

        filter(selector: string): jQuery {
            const filteredElements = this.elements.filter(el =>
                el.matches(selector)
            );
            return this.newContext(filteredElements);
        }

        first(): jQuery {
            const firstElement = this.elements[0] ? [this.elements[0]] : [];
            return this.newContext(firstElement);
        }

        focus(): jQuery {
            if (this.elements[0] instanceof HTMLElement) {
                this.elements[0].focus();
            }
            return this;
        }

        focusin(handler?: (this: Element, ev: FocusEvent) => unknown): jQuery {
            if (handler) {
                return this.on(
                    'focusin',
                    handler as (this: Element, ev: Event) => unknown
                );
            } else {
                // focusin might not be directly triggerable as it's not a standard DOM event in all browsers
                console.warn('focusin trigger not supported in mock-jQuery.');
            }
            return this;
        }

        focusout(handler?: (this: Element, ev: FocusEvent) => unknown): jQuery {
            if (handler) {
                return this.on(
                    'focusout',
                    handler as (this: Element, ev: Event) => unknown
                );
            } else {
                // focusout might not be directly triggerable as it's not a standard DOM event in all browsers
                console.warn('focusout trigger not supported in mock-jQuery.');
            }
            return this;
        }

        get(index?: number): Element[] | Element | undefined {
            if (index !== undefined) {
                return this.elements[index];
            }
            return [...this.elements];
        }

        hasClass(className: string): boolean {
            if (
                this.elements.length > 0 &&
                this.elements[0] instanceof HTMLElement
            ) {
                return this.elements[0].classList.contains(className);
            }
            return false;
        }

        height(): number | undefined {
            if (
                this.elements.length > 0 &&
                this.elements[0] instanceof HTMLElement
            ) {
                return this.elements[0].clientHeight;
            }
            return undefined;
        }

        hide(): jQuery {
            this.elements
                .filter(el => el instanceof HTMLElement)
                .forEach(element => {
                    (element as HTMLElement).style.display = 'none';
                });
            return this;
        }

        hover(
            handlerIn: (this: Element, ev: MouseEvent) => unknown,
            handlerOut?: (this: Element, ev: MouseEvent) => unknown
        ): jQuery {
            this.elements.forEach(element => {
                element.addEventListener(
                    'mouseenter',
                    handlerIn as EventListener
                );
                if (handlerOut) {
                    element.addEventListener(
                        'mouseleave',
                        handlerOut as EventListener
                    );
                }
            });
            return this;
        }

        html(htmlString?: string): jQuery | string {
            if (htmlString === undefined) {
                // Acting as a getter
                return this.elements[0] ? this.elements[0].innerHTML : '';
            } else {
                // Acting as a setter
                this.elements.forEach(el => {
                    el.innerHTML = htmlString;
                });
                return this;
            }
        }

        index(selector?: string): number {
            if (!selector) {
                return this.elements[0] && this.elements[0].parentNode
                    ? Array.from(this.elements[0].parentNode.children).indexOf(
                          this.elements[0]
                      )
                    : -1;
            } else {
                const elements = this.querySelectorAll(document, selector);
                return Array.from(elements).indexOf(this.elements[0]);
            }
        }

        insertAfter(target: string | Element | jQuery): jQuery {
            if (typeof target === 'string') {
                this.querySelectorAll(document, target).forEach(t => {
                    this.elements.forEach(el => {
                        t.parentNode?.insertBefore(el, t.nextSibling);
                    });
                });
            } else if (target instanceof Element) {
                this.elements.forEach(el => {
                    target.parentNode?.insertBefore(el, target.nextSibling);
                });
            } else if (target instanceof jQuery) {
                target.elements.forEach(t => {
                    this.elements.forEach(el => {
                        t.parentNode?.insertBefore(el, t.nextSibling);
                    });
                });
            }
            return this;
        }

        is(selector: string): boolean {
            return this.elements.some(el => el.matches(selector));
        }

        keydown(
            handler?: (this: Element, ev: KeyboardEvent) => unknown
        ): jQuery {
            if (handler) {
                return this.on('keydown', (ev: Event) =>
                    handler.call(ev.target as Element, ev as KeyboardEvent)
                );
            } else {
                return this.trigger('keydown');
            }
        }

        keypress(
            handler?: (this: Element, ev: KeyboardEvent) => unknown
        ): jQuery {
            if (handler) {
                return this.on('keypress', (ev: Event) =>
                    handler.call(ev.target as Element, ev as KeyboardEvent)
                );
            } else {
                return this.trigger('keypress');
            }
        }

        keyup(handler?: (this: Element, ev: KeyboardEvent) => unknown): jQuery {
            if (handler) {
                return this.on('keyup', (ev: Event) =>
                    handler.call(ev.target as Element, ev as KeyboardEvent)
                );
            } else {
                return this.trigger('keyup');
            }
        }

        last(): jQuery {
            const lastElement =
                this.elements.length > 0
                    ? [this.elements[this.elements.length - 1]]
                    : [];
            return this.newContext(lastElement);
        }

        get length(): number {
            return this.elements.length;
        }

        off(
            eventType: string,
            handler: (this: Element, ev: Event) => unknown
        ): jQuery {
            // ignore namespace
            const eventTypes = eventType.split('.');
            const eventName = eventTypes[0];
            this.elements.forEach(element => {
                element.removeEventListener(eventName, handler);
            });
            return this;
        }

        offset(): { top: number; left: number } | undefined {
            if (
                this.elements.length > 0 &&
                this.elements[0] instanceof HTMLElement
            ) {
                const rect = this.elements[0].getBoundingClientRect();
                return {
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                };
            }
            return undefined;
        }

        on(
            eventType: string,
            handler: (this: Element, ev: Event) => unknown
        ): jQuery {
            // ignore namespace
            const eventTypes = eventType.split('.');
            const eventName = eventTypes[0];
            this.elements.forEach(element => {
                element.addEventListener(eventName, function (ev) {
                    handler.call(element, ev);
                });
            });
            return this;
        }

        one(
            eventType: string,
            handler: (this: Element, ev: Event) => unknown
        ): jQuery {
            this.elements.forEach(element => {
                const onceHandler = (ev: Event) => {
                    handler.call(element, ev);
                    element.removeEventListener(eventType, onceHandler);
                };
                element.addEventListener(eventType, onceHandler);
            });
            return this;
        }

        outerHeight(includeMargin?: boolean): number | undefined {
            if (
                this.elements.length > 0 &&
                this.elements[0] instanceof HTMLElement
            ) {
                let height = this.elements[0].offsetHeight;
                if (includeMargin) {
                    const style = getComputedStyle(this.elements[0]);
                    height +=
                        parseInt(style.marginTop) +
                        parseInt(style.marginBottom);
                }
                return height;
            }
            return undefined;
        }

        outerWidth(includeMargin?: boolean): number | undefined {
            if (
                this.elements.length > 0 &&
                this.elements[0] instanceof HTMLElement
            ) {
                let width = this.elements[0].offsetWidth;
                if (includeMargin) {
                    const style = getComputedStyle(this.elements[0]);
                    width +=
                        parseInt(style.marginLeft) +
                        parseInt(style.marginRight);
                }
                return width;
            }
            return undefined;
        }

        map(
            callback: (
                this: Element,
                index: number,
                element: Element
            ) => Element
        ): jQuery {
            const mappedElements = this.elements
                .map((el, index) => callback.call(el, index, el))
                .filter(el => el != null);
            return this.newContext(mappedElements);
        }

        mousedown(
            handler?: (this: Element, ev: MouseEvent) => unknown
        ): jQuery {
            if (handler) {
                return this.on('mousedown', (ev: Event) =>
                    handler.call(ev.target as Element, ev as MouseEvent)
                );
            } else {
                return this.trigger('mousedown');
            }
        }

        mouseenter(
            handler?: (this: Element, ev: MouseEvent) => unknown
        ): jQuery {
            if (handler) {
                return this.on('mouseenter', (ev: Event) =>
                    handler.call(ev.target as Element, ev as MouseEvent)
                );
            } else {
                return this.trigger('mouseenter');
            }
        }

        mouseleave(
            handler?: (this: Element, ev: MouseEvent) => unknown
        ): jQuery {
            if (handler) {
                return this.on('mouseleave', (ev: Event) =>
                    handler.call(ev.target as Element, ev as MouseEvent)
                );
            } else {
                return this.trigger('mouseleave');
            }
        }

        mousemove(
            handler?: (this: Element, ev: MouseEvent) => unknown
        ): jQuery {
            if (handler) {
                return this.on('mousemove', (ev: Event) =>
                    handler.call(ev.target as Element, ev as MouseEvent)
                );
            } else {
                return this.trigger('mousemove');
            }
        }

        mouseout(handler?: (this: Element, ev: MouseEvent) => unknown): jQuery {
            if (handler) {
                return this.on('mouseout', (ev: Event) =>
                    handler.call(ev.target as Element, ev as MouseEvent)
                );
            } else {
                return this.trigger('mouseout');
            }
        }

        mouseover(
            handler?: (this: Element, ev: MouseEvent) => unknown
        ): jQuery {
            if (handler) {
                return this.on('mouseover', (ev: Event) =>
                    handler.call(ev.target as Element, ev as MouseEvent)
                );
            } else {
                return this.trigger('mouseover');
            }
        }

        mouseup(handler?: (this: Element, ev: MouseEvent) => unknown): jQuery {
            if (handler) {
                return this.on('mouseup', (ev: Event) =>
                    handler.call(ev.target as Element, ev as MouseEvent)
                );
            } else {
                return this.trigger('mouseup');
            }
        }

        next(): jQuery {
            const nextElements = this.elements
                .map(el => el.nextElementSibling)
                .filter(el => el != null) as Element[];
            return this.newContext(nextElements);
        }

        not(selector: string): jQuery {
            const filteredElements = this.elements.filter(
                el => !el.matches(selector)
            );
            return this.newContext(filteredElements);
        }

        parent(): jQuery {
            const parentElements = this.elements
                .map(element => element.parentElement)
                .filter(el => el !== null) as Element[];
            return this.newContext(parentElements);
        }

        position(): { top: number; left: number } | undefined {
            if (
                this.elements.length > 0 &&
                this.elements[0] instanceof HTMLElement
            ) {
                const el = this.elements[0];
                return {
                    top: el.offsetTop,
                    left: el.offsetLeft,
                };
            }
            return undefined;
        }

        prepend(content: string | Element | jQuery): jQuery {
            this.elements.forEach((el, index) => {
                if (typeof content === 'string') {
                    el.insertAdjacentHTML('afterbegin', content);
                } else if (content instanceof Element) {
                    if (index === this.elements.length - 1) {
                        el.insertBefore(content, el.firstChild);
                    } else {
                        const clonedContent = content.cloneNode(true);
                        el.insertBefore(clonedContent, el.firstChild);
                    }
                } else if (content instanceof jQuery) {
                    content.elements.forEach((contentEl, contentIndex) => {
                        if (
                            index === this.elements.length - 1 &&
                            contentIndex === content.elements.length - 1
                        ) {
                            el.insertBefore(contentEl, el.firstChild);
                        } else {
                            const clonedContentEl = contentEl.cloneNode(true);
                            el.insertBefore(clonedContentEl, el.firstChild);
                        }
                    });
                }
            });
            return this;
        }

        prependTo(target: string | Element | jQuery): jQuery {
            if (typeof target === 'string') {
                const targets = this.querySelectorAll(document, target);
                targets.forEach((t, targetIndex) => {
                    this.elements.forEach((el, elIndex) => {
                        if (
                            targetIndex === targets.length - 1 &&
                            elIndex === this.elements.length - 1
                        ) {
                            t.insertBefore(el, t.firstChild);
                        } else {
                            const clonedEl = el.cloneNode(true);
                            t.insertBefore(clonedEl, t.firstChild);
                            this.elements.push(clonedEl as Element); // Add cloned nodes to our elements
                        }
                    });
                });
            } else if (target instanceof Element) {
                this.elements.forEach((el, index) => {
                    if (index === this.elements.length - 1) {
                        target.insertBefore(el, target.firstChild);
                    } else {
                        const clonedEl = el.cloneNode(true);
                        target.insertBefore(clonedEl, target.firstChild);
                        this.elements.push(clonedEl as Element); // Add cloned nodes to our elements
                    }
                });
            } else if (target instanceof jQuery) {
                target.elements.forEach((t, targetIndex) => {
                    this.elements.forEach((el, elIndex) => {
                        if (
                            targetIndex === target.elements.length - 1 &&
                            elIndex === this.elements.length - 1
                        ) {
                            t.insertBefore(el, t.firstChild);
                        } else {
                            const clonedEl = el.cloneNode(true);
                            t.insertBefore(clonedEl, t.firstChild);
                            this.elements.push(clonedEl as Element); // Add cloned nodes to our elements
                        }
                    });
                });
            }
            return this;
        }

        prev(): jQuery {
            const prevElements = this.elements
                .map(el => el.previousElementSibling)
                .filter(el => el != null) as Element[];
            return this.newContext(prevElements);
        }

        prop<T extends Element[keyof Element]>(
            propertyName: keyof Element,
            value?: T
        ): jQuery | T | undefined {
            if (value === undefined) {
                // Acting as a getter
                return this.elements.length > 0
                    ? (this.elements[0][propertyName] as T) ?? undefined
                    : undefined;
            } else {
                // Acting as a setter
                this.elements.forEach(el => {
                    // proper solution would have been to somehow type propertyName
                    // as a non readonly keyof, which is complex
                    el[propertyName as 'innerHTML'] = value as string;
                });
                return this;
            }
        }

        ready(fn: () => void): void {
            if (document.readyState !== 'loading') {
                fn();
            } else {
                document.addEventListener('DOMContentLoaded', fn);
            }
        }

        remove(): jQuery {
            this.elements.forEach(el => {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
            // After removing elements from the DOM, clear the elements array
            this.elements = [];
            return this;
        }

        removeClass(className: string): jQuery {
            this.elements.forEach(el => {
                if (el instanceof HTMLElement) {
                    el.classList.remove(className);
                }
            });
            return this;
        }

        removeData(key: string): jQuery {
            this.elements.forEach(el => {
                jQueryFn.removeData(el, key);
            });
            return this;
        }

        resize(handler?: (this: Element, ev: Event) => unknown): jQuery {
            if (handler) {
                return this.on(
                    'resize',
                    handler as (this: Element, ev: Event) => unknown
                );
            } else {
                return this.trigger('resize');
            }
        }

        scroll(handler?: (this: Element, ev: UIEvent) => unknown): jQuery {
            if (handler) {
                return this.on(
                    'scroll',
                    handler as (this: Element, ev: Event) => unknown
                );
            } else {
                return this.trigger('scroll');
            }
        }

        scrollLeft(value?: number): jQuery | number {
            if (value === undefined) {
                // Acting as a getter
                if (
                    this.elements.length > 0 &&
                    this.elements[0] instanceof HTMLElement
                ) {
                    return this.elements[0].scrollLeft;
                }
                return 0;
            } else {
                // Acting as a setter
                this.elements.forEach(el => {
                    if (el instanceof HTMLElement) {
                        el.scrollLeft = value;
                    }
                });
                return this;
            }
        }

        scrollTop(value?: number): jQuery | number {
            if (value === undefined) {
                // Acting as a getter
                return this.elements.length > 0 &&
                    this.elements[0] instanceof HTMLElement
                    ? this.elements[0].scrollTop
                    : 0;
            } else {
                // Acting as a setter
                this.elements.forEach(el => {
                    if (el instanceof HTMLElement) {
                        el.scrollTop = value;
                    }
                });
                return this;
            }
        }

        select(handler?: (this: Element, ev: Event) => unknown): jQuery {
            if (handler) {
                return this.on('select', handler);
            } else {
                return this.trigger('select');
            }
        }

        serialize(): string {
            return this.elements
                .filter(
                    el =>
                        el instanceof HTMLInputElement ||
                        el instanceof HTMLSelectElement ||
                        el instanceof HTMLTextAreaElement
                )
                .map(
                    el =>
                        encodeURIComponent(
                            (
                                el as
                                    | HTMLInputElement
                                    | HTMLSelectElement
                                    | HTMLTextAreaElement
                            ).name
                        ) +
                        '=' +
                        encodeURIComponent(
                            (
                                el as
                                    | HTMLInputElement
                                    | HTMLSelectElement
                                    | HTMLTextAreaElement
                            ).value
                        )
                )
                .join('&');
        }

        serializeArray(): { name: string; value: string }[] {
            return this.elements
                .filter(
                    el =>
                        el instanceof HTMLInputElement ||
                        el instanceof HTMLSelectElement ||
                        el instanceof HTMLTextAreaElement
                )
                .map(el => ({
                    name: (
                        el as
                            | HTMLInputElement
                            | HTMLSelectElement
                            | HTMLTextAreaElement
                    ).name,
                    value: (
                        el as
                            | HTMLInputElement
                            | HTMLSelectElement
                            | HTMLTextAreaElement
                    ).value,
                }));
        }

        show(): jQuery {
            this.elements
                .filter(el => el instanceof HTMLElement)
                .forEach(element => {
                    if (
                        window.getComputedStyle(element).display === 'none' &&
                        (element as HTMLElement).style.display !== 'none'
                    ) {
                        (element as HTMLElement).style.display = 'initial';
                    } else {
                        (element as HTMLElement).style.display = '';
                    }
                });
            return this;
        }

        slideDown(): jQuery {
            this.elements.forEach(el => {
                if (el instanceof HTMLElement) {
                    el.style.display = '';
                }
            });
            return this;
        }

        slideToggle(): jQuery {
            this.elements.forEach(el => {
                if (el instanceof HTMLElement) {
                    el.style.display =
                        el.style.display === 'none' ? '' : 'none';
                }
            });
            return this;
        }

        slideUp(): jQuery {
            this.elements.forEach(el => {
                if (el instanceof HTMLElement) {
                    el.style.display = 'none';
                }
            });
            return this;
        }

        stop(): jQuery {
            // Since animations are not supported, stop does nothing
            console.warn('stop() has no effect in mock-jQuery.');
            return this;
        }

        submit(): jQuery {
            if (this.elements[0] instanceof HTMLFormElement) {
                this.elements[0].submit();
            }
            return this;
        }

        text(value?: string): jQuery | string {
            if (value === undefined) {
                // Acting as a getter
                return this.elements.map(el => el.textContent).join('');
            } else {
                // Acting as a setter
                this.elements.forEach(el => {
                    el.textContent = value;
                });
                return this;
            }
        }

        toggle(): jQuery {
            this.elements.forEach(el => {
                if (el instanceof HTMLElement) {
                    const style = getComputedStyle(el);
                    if (style.display === 'none') {
                        el.style.display = '';
                    } else {
                        el.style.display = 'none';
                    }
                }
            });
            return this;
        }

        toggleClass(classNames: string): jQuery {
            const classes = classNames.split(' ');
            this.elements.forEach(el => {
                if (el instanceof HTMLElement) {
                    classes.forEach(className => {
                        if (el.classList.contains(className)) {
                            el.classList.remove(className);
                        } else {
                            el.classList.add(className);
                        }
                    });
                }
            });
            return this;
        }

        trigger(eventType: string | Event): jQuery {
            if (typeof eventType === 'string') {
                // ignore namespace for string type
                const eventTypes = eventType.split('.');
                const eventName = eventTypes[0];
                this.elements.forEach(el => {
                    const event = new Event(eventName);
                    el.dispatchEvent(event);
                });
            } else if (
                (eventType as Event & { originEvent: Event }).originEvent
            ) {
                // Directly dispatch the Event object
                this.elements.forEach(el => {
                    el.dispatchEvent(
                        (eventType as Event & { originEvent: Event })
                            .originEvent
                    );
                });
            }
            return this;
        }

        val(value?: string): jQuery | string {
            if (value === undefined) {
                // Getter: Return the value of the first element
                if (
                    this.elements.length > 0 &&
                    this.elements[0] instanceof HTMLInputElement
                ) {
                    return (this.elements[0] as HTMLInputElement).value;
                }
                return ''; // Return empty string if no elements or not an input element
            } else {
                // Setter: Set the value for all input elements
                this.elements
                    .filter(el => el instanceof HTMLInputElement)
                    .forEach(element => {
                        (element as HTMLInputElement).value = value;
                    });
                return this;
            }
        }

        width(): number | undefined {
            if (
                this.elements.length > 0 &&
                this.elements[0] instanceof HTMLElement
            ) {
                return this.elements[0].clientWidth;
            }
            return undefined;
        }

        wrap(wrapperString: string): jQuery {
            this.elements.forEach(element => {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = wrapperString;
                const wrapperInner = wrapper.children[0];
                if (element.parentNode && wrapperInner) {
                    element.parentNode.insertBefore(wrapperInner, element);
                    wrapperInner.appendChild(element);
                }
            });
            return this;
        }
    }

    function jQueryFn(selector: string, context?: JqueryContext): jQuery;
    function jQueryFn(selector: Element): jQuery;
    function jQueryFn(selector: Element[]): jQuery;
    function jQueryFn(
        selector: string | Element | Element[],
        context?: JqueryContext
    ): jQuery;
    function jQueryFn(
        selector: string | Element | Element[],
        context?: JqueryContext
    ): jQuery {
        return new Proxy(
            new jQuery(selector, context),
            // proxy handler
            {
                get: function (target, prop) {
                    if (prop in target) {
                        return target[prop as keyof typeof target];
                    } else {
                        let propAsNumber = NaN;
                        try {
                            propAsNumber = Number(prop);
                        } catch (e) {
                            // ignore errors
                        }
                        if (!isNaN(propAsNumber)) {
                            return target.get(propAsNumber);
                        } else if (prop === 'jquery') {
                            // jquery-ui widget will interrogate this property
                            // just ignore it
                            return undefined;
                        } else {
                            console.error(
                                `Attempted to access jQuery property: \`${String(
                                    prop
                                )}\` but it was not emulated.`
                            );
                            return undefined;
                        }
                    }
                },
            }
        );
    }

    jQueryFn.ajax = <T extends BodyInit | null | undefined>(settings: {
        url: string;
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        data?: T;
        headers?: HeadersInit;
    }): Promise<Response> => {
        const { url, method = 'GET', data, headers } = settings;
        const options: RequestInit = {
            method,
            headers,
            body: undefined,
        };

        if (data) {
            if (method === 'GET') {
                console.warn(
                    'Data payload with GET request might not be sent by some browsers.'
                );
            } else {
                if (typeof data === 'object') {
                    options.body = JSON.stringify(data);
                    options.headers = {
                        ...headers,
                        'Content-Type': 'application/json',
                    };
                } else {
                    options.body = data; // Assuming stringified data or FormData
                }
            }
        }

        return fetch(url, options);
    };

    jQueryFn.data = function <T = unknown>(
        element: Element,
        key: string,
        value?: T
    ): T {
        const dataKey = `jQueryData-${key}`;
        if (value === undefined) {
            // Getter
            return (element as unknown as Record<string, T>)[dataKey];
        } else {
            // Setter
            (element as unknown as Record<string, T>)[dataKey] = value;
            return value;
        }
    };

    jQueryFn.each = function <T = unknown>(
        objectOrArray: T[] | Record<string, T>,
        callback: (indexOrKey: number | string, elementOrValue: T) => void
    ): void {
        if (Array.isArray(objectOrArray)) {
            objectOrArray.forEach((element, index) => {
                callback.call(element, index, element);
            });
        } else {
            Object.keys(objectOrArray).forEach(key => {
                callback.call(objectOrArray[key], key, objectOrArray[key]);
            });
        }
    };

    type EventThis = {
        originalEvent: Event;
        type: string;
        isDefaultPrevented: boolean;
        target: EventTarget;
        currentTarget: EventTarget | null;
        relatedTarget: EventTarget | null;
        timeStamp: number;
    };
    jQueryFn.Event = function (
        this: EventThis,
        src?: Event,
        props?: Record<string, unknown>
    ) {
        if (!(this instanceof jQueryFn.Event)) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            return new jQueryFn.Event(src, props);
        }

        if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;

            // The event may have been prevented by a handler
            this.isDefaultPrevented =
                src.defaultPrevented ||
                (src.defaultPrevented === undefined &&
                    // Support: Android <=2.3 only
                    src.returnValue === false)
                    ? true
                    : false;

            const elementTarget = src.target as Element;

            this.target = (
                elementTarget && elementTarget.nodeType === 3
                    ? elementTarget.parentNode
                    : elementTarget
            ) as EventTarget;

            this.currentTarget = src.currentTarget;
        } else {
            this.type = src as unknown as string;
        }

        // Put explicitly provided properties onto the event object
        if (props) {
            Object.assign(this, props);
        }

        // Create a timestamp if incoming event doesn't have one
        this.timeStamp = (src && src.timeStamp) || Date.now();
    };

    function returnTrue() {
        return true;
    }

    function returnFalse() {
        return false;
    }

    // jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
    // https://www.w3.org/TR/2003/NOTE-DOM-Level-3-Events-20031107/ecma-script-binding.html
    jQueryFn.Event.prototype = {
        constructor: jQueryFn.Event,
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,
        isSimulated: false,

        preventDefault: function () {
            const e = this.originalEvent;
            this.isDefaultPrevented = returnTrue;

            if (e && !this.isSimulated) {
                e.preventDefault();
            }
        },
        stopPropagation: function () {
            const e = this.originalEvent;
            this.isPropagationStopped = returnTrue;

            if (e && !this.isSimulated) {
                e.stopPropagation();
            }
        },
        stopImmediatePropagation: function () {
            const e = this.originalEvent;
            this.isImmediatePropagationStopped = returnTrue;

            if (e && !this.isSimulated) {
                e.stopImmediatePropagation();
            }

            this.stopPropagation();
        },
    };

    jQueryFn.expr = {
        pseudos: {},
    };

    jQueryFn.extend = function (...args: unknown[]): Record<string, unknown> {
        let target: unknown = args[0] || {};
        let i = 1;
        const length = args.length;
        let deep = false;
        let options: unknown,
            name: string,
            src: unknown,
            copy: unknown,
            copyIsArray: unknown,
            clone: unknown;

        if (typeof target === 'boolean') {
            deep = target;
            target = args[i] || {};
            i++;
        }

        if (typeof target !== 'object' && typeof target !== 'function') {
            target = {};
        }

        if (i === length) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            target = this;
            i--;
        }

        for (; i < length; i++) {
            if ((options = args[i]) != null) {
                for (name in options) {
                    src = (target as Record<string, unknown>)[name];
                    copy = (options as Record<string, unknown>)[name];

                    if (target === copy) {
                        continue;
                    }

                    if (
                        deep &&
                        copy &&
                        (typeof copy === 'object' ||
                            (copyIsArray = Array.isArray(copy)))
                    ) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];
                        } else {
                            clone = src && typeof src === 'object' ? src : {};
                        }

                        (target as Record<string, unknown>)[name] =
                            jQueryFn.extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        (target as Record<string, unknown>)[name] = copy;
                    }
                }
            }
        }

        return target as Record<string, unknown>;
    };

    jQueryFn.fn = jQuery.prototype as unknown as Record<string, unknown>;

    jQueryFn.get = (
        url: string,
        data?: (...args: unknown[]) => unknown,
        success?: (data: unknown) => void,
        _dataType?: string
    ): Promise<Response> => {
        if (typeof data === 'function') {
            success = data;
            data = undefined;
        }
        return jQueryFn
            .ajax({
                url,
                method: 'GET',
                data,
            })
            .then(response => {
                if (success) success(response);
                return response;
            });
    };

    jQueryFn.getJSON = (
        url: string,
        data?: (...args: unknown[]) => unknown,
        success?: (data: unknown) => void
    ): Promise<Response> => {
        return jQueryFn.get(
            url,
            data,
            response => {
                const jsonData = JSON.parse(response as string);
                if (success) success(jsonData);
            },
            'json'
        );
    };

    jQueryFn.getScript = (
        url: string,
        success?: () => void
    ): Promise<unknown> => {
        return jQueryFn.get(url, undefined, response => {
            // eslint-disable-next-line no-eval
            eval(response as string);
            if (success) success();
        });
    };

    jQueryFn.isPlainObject = (obj: unknown): obj is Record<string, unknown> => {
        if (typeof obj !== 'object' || obj === null) return false;
        const proto = Object.getPrototypeOf(obj);
        return proto === null || proto === Object.prototype;
    };

    jQueryFn.map = <TResult>(
        array: ArrayLike<unknown>,
        callback: (element: unknown, index: number) => TResult
    ): TResult[] => {
        const results: TResult[] = [];
        for (let i = 0; i < array.length; i++) {
            const result = callback(array[i], i);
            if (result != null) {
                results.push(result);
            }
        }
        return results;
    };

    jQueryFn.noop = () => {
        // noop
    };

    jQueryFn.post = <TData extends BodyInit | undefined | null, TResponse>(
        url: string,
        data?: TData | ((data: TResponse) => void),
        success?: (data: TResponse) => void,
        _dataType?: string
    ): Promise<Response> => {
        if (typeof data === 'function') {
            success = data as (data: TResponse) => void;
            data = undefined;
        }
        return jQueryFn
            .ajax({
                url,
                method: 'POST',
                data: data as TData,
            })
            .then(response => {
                if (success) success(response as unknown as TResponse);
                return response;
            });
    };

    jQueryFn.removeData = function (element: Element, key: string): void {
        const dataKey = `jQueryData-${key}`;
        if (
            Object.prototype.hasOwnProperty.call(
                element as unknown as Record<string, unknown>,
                dataKey
            )
        ) {
            delete (element as unknown as Record<string, unknown>)[dataKey];
        }
    };

    jQueryFn.uniqueSort = (elements: Element[]): Element[] => {
        const uniqueElements = Array.from(new Set(elements));
        return uniqueElements.sort((a, b) => {
            if (a.compareDocumentPosition(b) & 2) {
                return 1;
            } else {
                return -1;
            }
        });
    };

    return jQueryFn;
};
