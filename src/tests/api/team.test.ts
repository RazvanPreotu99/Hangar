import { NextFunction, Request, Response } from 'express';
import 'jest';
import supertest from 'supertest';
import { Team } from '../../entities/team';
import logger from '../../logger';

/* eslint-disable @typescript-eslint/no-var-requires, global-require */

jest.mock('../../discord');
jest.mock('../../env');
const requireAuthMock = jest.fn((_req: Request, _res: Response, next: NextFunction) => next());
jest.mock('../../api/middleware/requireAuth', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requireAuth: jest.fn(() => (_req: Request, _res: Response, next: NextFunction): any => requireAuthMock(_req, _res, next)),
}));

const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation();

const teamFindSpy = jest.spyOn(Team, 'find');
describe('getAllTeams', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('will send back a list of all teams in the DB', async () => {
    teamFindSpy.mockResolvedValue([]);
    const { app } = require('../../app');
    await supertest(app)
      .get('/api/team/getAll')
      .set({
        'Content-Type': 'application/json',
      })
      .expect(200);

    expect(teamFindSpy).toBeCalledTimes(1);
    expect(teamFindSpy.mock.calls[0][0]).toBeUndefined();
  });

  it('will throw a 500 if a DB error occurs', async () => {
    teamFindSpy.mockRejectedValueOnce('oh no :(');
    const { app } = require('../../app');
    await supertest(app)
      .get('/api/team/getAll')
      .set({
        'Content-Type': 'application/json',
      })
      .expect(500);

    expect(teamFindSpy).toBeCalledTimes(1);
    expect(loggerErrorSpy).toBeCalledTimes(1);
  });
});
