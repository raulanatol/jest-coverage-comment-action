.DEFAULT_GOAL := check

start:
	@echo "🏃‍♀️ Starting project"
	npm install

test:
	@echo "Testing..."
	npm test

build:
	@echo "👩‍🏭 Building..."
	@npm build
	@npm run package

check: --pre_check test build
	@echo "✅"

docs:
	@doctoc .
	@echo "📚 Documentation ready!"

release_patch: release

release_minor: check
	@.scripts/finish-release minor

release_major: check
	@.scripts/finish-release major

release: check
	@.scripts/finish-release patch

--pre_check:
	@npm run clean
	@npm install
	@yarn lint
	@yarn tsc --project tsconfig.json
