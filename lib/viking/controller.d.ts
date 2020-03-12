type ActionMethod = function(function)
type ActionObject = {
  method: ActionMethod | string
}
type Actions = [string | ActionMethod | ActionObject]

declare interface ControllerSubclass {
  static aroundActions: Actions
}

declare abstract class Controller {
  static aroundActions: Actions
  static extended: function(Controller)
}
