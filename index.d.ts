interface IWickedElementsComponent<A extends Array<string>> {
  /**
   * Always triggered once a node is live (even with classes).
   * Right before `onconnected` and only once,
   * ideal to setup anything as a one off operation.
   */
  init(e: Event): void;
  /**
   * Triggered once live.
   * If defined later on and already live it will trigger once (setup here).
   */
  onconnected?(e: Event): void;
  /**
   * Triggered once lost/removed.
   */
  ondisconnected?(e: Event): void;
  /**
   * Triggered when an attribute in the `attributeFilter` property changes,
   * or, if said property is not defined or is an empty array, any time an
   * attribute changes. 
   */
  onattributechanged?(e: {
    attributeName: A[number];
    oldValue: string | null;
    newValue: string | null;
  }): void;
  /**
   * optionally you can specify attributes to observe
   * by default, or with an empty list, all attributes are notified
   */
  attributeFilter?: A;
  /**
   * If styling is supplied, it'll be injected only once per component.
   * Inherited styles won't get injected.
   */
  style?: string;
  [k: string]: any;
}

declare const wickedElements: {
  /**
   * defines a wicked element.
   */
  define<A extends Array<string>>(
    /**
     * targeted CSS selector.
     */
    selector: string,
    /**
     * wicked element component definition.
     */
    component: IWickedElementsComponent<A>
  ): void;
};
export default wickedElements;
