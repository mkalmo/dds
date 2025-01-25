import { expect, test } from '@jest/globals';
import Repository from "../modules/Repository.ts";
import FakeStorage from "./FakeStorage.ts";

test('Stores pbn value', () => {

    const repo = new Repository(new FakeStorage());

    repo.storePbn('test');

    expect(repo.readPbn()).toBe('test');
});

