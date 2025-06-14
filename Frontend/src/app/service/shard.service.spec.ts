import { TestBed } from '@angular/core/testing';

import { ShardService } from './shard.service';

describe('ShardService', () => {
  let service: ShardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
