/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const datastore = require(`@google-cloud/datastore`)();
const tasks = require(`../tasks`);

describe(`datastore:tasks`, () => {
  const description = `description`;
  let key;

  after(() => datastore.delete(key));

  it(`should add a task`, () => {
    return tasks.addTask(description)
      .then((taskKey) => {
        key = taskKey;
        return datastore.get(key);
      })
      .then((results) => {
        const task = results[0];
        const taskKey = task[datastore.KEY];
        assert.equal(taskKey.id, key.id);
        assert.equal(task.description, description);
      });
  });

  it(`should mark a task as done`, () => {
    return tasks.markDone(key.id)
      .then(() => datastore.get(key))
      .then((results) => {
        const task = results[0];
        const taskKey = task[datastore.KEY];
        assert.equal(taskKey.id, key.id);
        assert.equal(task.description, description);
        assert.equal(task.done, true);
      });
  });

  it(`should list tasks`, () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        tasks.listTasks().then(resolve, reject);
      }, 5000);
    })
      .then((tasks) => {
        tasks = tasks.filter((task) => task[datastore.KEY].id === key.id);
        assert.equal(tasks.length, 1);
      });
  });

  it(`should delete a task`, () => {
    return tasks.deleteTask(key.id)
      .then(() => datastore.get(key))
      .then((results) => {
        assert.equal(results[0], undefined);
      });
  });
});
