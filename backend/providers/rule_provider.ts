import { ApplicationService } from '@adonisjs/core/types'
import registerExist from '../rules/exist.js';
import registerUnique from '../rules/unique.js';


export default class RuleProvider {
  constructor(protected app: ApplicationService) {}

  register() {}

  boot() {
    registerExist();
    registerUnique();
  }
}
