import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { StorageService } from './storage/storage.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [StorageService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getDocumentById('toto', undefined)).toBe(
        'Hello World!',
      );
    });
  });
});
