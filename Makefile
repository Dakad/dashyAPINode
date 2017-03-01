DIRSRC		= ./src
DIRTEST 	= ./test
DIRCOVER	= ./docs/specs

REPORTER	= spec



dev:
	@NODE_ENV=dev \
	./node_modules/.bin/nodemon $(DIRSRC)/app.js

start:
	@echo **** Runnig lint-watch || test-watch
	npm-run-all --parallel test-watch open-src lint-watch


lint:
	@echo '****** Linting $(DIRSRC)'
	@./node_modules/.bin/eslint \
		--color \
		--env mocha node \
		$(DIRSRC)

test: lint
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--bail \
		--colors \
		--reporter $(REPORTER) \
		--timeout 5000 \
		--growl \
		$(DIRTEST)/**/*.spec.js

test-watch:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--bail \
		--colors \
		--require assert \
		--reporter $(REPORTER) \
		--timeout 5000 \
		--growl \
		-- watch \
		$(DIRTEST)/*.spec.js


test-cover: lint
	@./node_modules/.bin/istanbul cover \
	@./node_modules/.bin/mocha -R doc


test-coveralls:
	@echo ****** TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	./node_modules/.bin/istanbul cover \
	./node_modules/mocha/bin/mocha --report lcovonly -- -R $(DIRCOVER)\
	cat $(DIRCOVER)/coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js || true


test-docs:
	$(MAKE) test --reporter=doc \
		| cat docs/head.html - docs/tail.html \
		> docs/test.html


precommit: test
	@echo "Can commit !"
	git add .


setup:
	@node setup.js


build:
	$(MAKE) lint\
	$(MAKE) test\
	NODE_ENV=prod\
	node --harmony $(DIRSRC)/app.js\

clean:
	@echo Clear logs folder
	@rm $(DIRSRC)/logs/*\

.PHONY: setup test
