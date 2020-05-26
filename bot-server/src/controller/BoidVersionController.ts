import { getRepository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { BoidVersion } from '../entity/BoidVersion';

export class BoidVersionController {
  private boidVersionRepository = getRepository(BoidVersion);

  async allPublished(request: Request, response: Response, next: NextFunction) {
    return this.boidVersionRepository.find({ published: true });
  }

  // async one(request: Request, response: Response, next: NextFunction) {
  //   return this.boidVersionRepository.findOne(request.params.id);
  // }

  async save(request: Request, response: Response, next: NextFunction) {
    return this.boidVersionRepository.save(request.body);
  }
}
