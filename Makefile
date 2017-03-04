DIR_SRC		= ./src
DIR_TEST 	= ./test
DIR_DOC		= ./doc
DIR_COVER	= $(DIR_DOC)/specs

DOC_TEMPL 	= ./node_modules/ink-docstrap/template
REPORTER	= spec



dev:
	@NODE_ENV=dev \
	./node_modules/.bin/nodemon $(DIR_SRC)/app.js

debug:
	@NODE_ENV=debug \
	DEBUG=node* nodemon $(DIR_SRC)/app.js

start:
	@echo "#### Runnig lint-watch || test-watch";
	npm-run-all --parallel test-watch open-src lint-watch


lint:
	@echo "#####  ESLint-ing $(DIR_SRC)" ;
	./node_modules/.bin/eslint --color $(DIR_SRC)

test: lint
	@echo "#####  Mocha Testing $(DIR_SRC) $(DIR_TEST)";
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--bail \
		--colors \
		--reporter $(REPORTER) \
		--timeout 2000 \
		--sort \
		--growl \
		$(DIR_SRC)/**/*.spec.js \
		$(DIR_TEST)/*.spec.js

test-watch:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--bail \
		--colors \
		--require assert \
		--reporter $(REPORTER) \
		--timeout 5000 \
		--growl \
		-- watch \
		$(DIR_SRC)/**/*.spec.js \
		$(DIR_TEST)/*.spec.js


test-cover: lint
	@./node_modules/.bin/istanbul cover \
	@./node_modules/.bin/mocha -R doc


test-coveralls:
	@echo "#####  TRAVIS_JOB_ID $(TRAVIS_JOB_ID)"
	./node_modules/.bin/istanbul cover \
	./node_modules/mocha/bin/mocha --report lcovonly -- -R $(REPORTER)\
	cat $(DIR_DOC)/coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js || true


test-docs:
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter=doc \
		| cat $(DIR_DOC)/head.html - $(DIR_DOC)/tail.html \
		> $(DIR_DOC)/test.html


commit: test
	@echo "New commit !";\
	git add .;\
	git commit -m "$m" ; \

commit-push:
	git push origin master

setup:
	@node setup.js

docs:
	@echo "#### JsDoc-ing folder: $(DIR_SRC)";
	@./node_modules/.bin/jsdoc\
		-c .jsdocrc.json \
		-d $(DIR_DOC) \
		-r \
		-t $(DOC_TEMPL) \
		-R README.md \
		--verbose \
		$(DIR_SRC) \

build: test test-docs docs
	@echo "##### Deleting the logs folder .... ";
	@rm -rf $(DIR_SRC)/logs; \
	@NODE_ENV=prod node --harmony $(DIR_SRC)/app.js \

clean:
	@echo Clear logs folder
	@rm $(DIR_SRC)/logs/*\



all: test 

.PHONY: setup test
