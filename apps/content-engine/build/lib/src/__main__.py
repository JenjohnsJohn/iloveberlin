"""Allow running with: python -m src"""

import asyncio
import sys

from src.main import main

try:
    asyncio.run(main())
except KeyboardInterrupt:
    sys.exit(0)
