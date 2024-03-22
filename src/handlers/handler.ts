import { Express } from "express"

export abstract class Handler {
  protected app: Express

  constructor(app: Express) {
    this.app = app
  }

  abstract setup(): void
}
