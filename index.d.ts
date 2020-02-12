interface IWickedElementsComponent {
  /**
   * Always triggered once per node => definition, like a `constructor`.
   * Ideal to setup anything as a one off operation.
   * `this.element` will point at the node handled by this instance.
   */
  init?(): void;

  /**
   * Triggered once the node is live.
   */
  connected?(): void;

  /**
   * Triggered once the node is lost/removed.
   */
  disconnected?(): void;

  /**
   * Triggered when an attribute in the `observedAttributes` list changes or,
   * if `observedAttributes` is not defined, for any attribute changes. 
   */
  attributeChanged?(
    attributeName: string,
    oldValue: string | null,
    newValue: string | null,
  ): void;

  /**
   * Optionally you can specify one or more attribute to observe.
   * If empty, or not provided, but `attributeChanged()` method exists,
   * all attributes changes are notified.
   */
  observedAttributes?: Array<string>;

  /**
   * Any event can be defined as method.
   * Example: `onClick` or `onCustomEvent`.
   */
  onEventName?(event:Event): void;

  /**
   * Ane event could optionally have `Options` used as third argument,
   * when the event is added via `addEventListener`: `false` by default.
   */
  onEventNameOptions?:boolean | object;
}

declare const wickedElements: {
  /**
   * Defines a wicked element.
   */
  define(
    selector: string,
    component: IWickedElementsComponent
  ): void;

  /**
   * Retrieves a wicked element definition.
   */
  get(selector: string): void | IWickedElementsComponent;

  /**
   * Force/upgrade a specific node, if it matches any defined selector.
   */
  upgrade(element:Element): void;

  /**
   * Resolves once a specific selector gets defined.
   */
  whenDefined(selector: string): Promise<void>;
};
export default wickedElements;
