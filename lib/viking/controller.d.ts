type ActionMethod = function(function)

type ActionTuple = [ string | ActionMethod, ActionOptions ];

type Actions = Array<string | ActionMethod | ActionTuple>;

declare interface ControllerSubclass {
  static aroundActions: Actions
}

declare abstract class Controller {
  static aroundActions: Actions
  static extended: function(Controller)
}
