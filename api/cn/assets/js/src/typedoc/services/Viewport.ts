/// <reference types='underscore' />
/// <reference path='../Application.ts' />

namespace typedoc
{
    /**
     * A global service that monitors the window size and scroll position.
     */
    export class Viewport extends Events
    {
        /**
         * The current scroll position.
         */
        scrollTop:number = 0;

        /**
         * The previous scrollTop.
         */
        lastY:number = 0;

        /**
         * The width of the window.
         */
        width:number = 0;

        /**
         * The height of the window.
         */
        height:number = 0;

        /**
         * The toolbar (contains the search input).
         */
        toolbar:HTMLDivElement;

        /**
         * Boolean indicating whether the toolbar is shown.
         */
        showToolbar:boolean = true;

        /**
         * The sticky side nav that contains members of the current page.
         */
        secondaryNav:HTMLElement;


        /**
         * Create new Viewport instance.
         */
        constructor() {
            super();

            this.toolbar = <HTMLDivElement>document.querySelector('.tsd-page-toolbar');
            this.secondaryNav = <HTMLElement>document.querySelector('.tsd-navigation.secondary');

            $window.on('scroll', _.throttle(() => this.onScroll(), 10))
            $window.on('resize', _.throttle(() => this.onResize(), 10));

            this.onResize();
            this.onScroll();
        }


        /**
         * Trigger a resize event.
         */
        triggerResize() {
            this.trigger('resize', this.width, this.height);
        }


        /**
         * Triggered when the size of the window has changed.
         */
        onResize() {
            this.width = $window.width() || 0;
            this.height = $window.height() || 0;
            this.trigger('resize', this.width, this.height);
        }


        /**
         * Triggered when the user scrolled the viewport.
         */
        onScroll() {
            this.scrollTop = $window.scrollTop() || 0;
            this.trigger('scroll', this.scrollTop);
            this.hideShowToolbar();
        }


        /**
         * Handle hiding/showing of the toolbar.
         */
        hideShowToolbar() {
            const isShown = this.showToolbar;
            this.showToolbar = this.lastY >= this.scrollTop || this.scrollTop === 0;
            if (isShown !== this.showToolbar) {
                this.toolbar.classList.toggle('tsd-page-toolbar--hide');
                this.secondaryNav.classList.toggle('tsd-navigation--toolbar-hide');
            }
            this.lastY = this.scrollTop;
        }
    }


    /**
     * Register service.
     */
    export var viewport:Viewport;
    registerService(Viewport, 'viewport');
}
