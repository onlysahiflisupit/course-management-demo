# Testing scope

Run `npm test` with Node.js 22 or later. The domain suite covers input validation, state changes and the boundaries described in the test names. It does not require a browser.

Browser regression checks live in [qa-testing-portfolio](https://github.com/onlysahiflisupit/qa-testing-portfolio). Clone the three repositories as siblings and follow its README.

The initial local verification passed all 9 domain tests for this application. The shared browser suite passed 16 checks across both applications. See the QA repository execution record for environment details and limitations.

Before changing a workflow, identify the failure it could introduce, update a meaningful assertion, run the affected tests and inspect the affected desktop and mobile screen. Print layout, keyboard-only use, assistive technology and cross-browser behavior still need dedicated human review. No production security or customer acceptance sign-off is claimed.
