<?php
namespace Slimpd\Modules\albummigrator\SchemaTests\TrackNumber;
use Slimpd\RegexHelper as RGX;
/* Copyright (C) 2015-2016 othmar52 <othmar52@users.noreply.github.com>
 *
 * This file is part of sliMpd - a php based mpd web client
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

class CombinedWithTotal extends \Slimpd\Modules\albummigrator\AbstractTests\AbstractTest {
	public $isAlbumWeight = 1;

	public function run() {
		$value = str_replace(array("of", " ", ".", ","), "/", $this->input);
		$matches = trimExplode("/", $value, TRUE);
		if(count($matches) < 2) {
			$this->result = 0;
			return;
		}
		$matches = array_map("removeLeadingZeroes", $matches);
		$this->matches = $matches;
		$this->result = "combined-with-total";
	}

	public function scoreMatches() {
		if(count($this->matches) === 0) {
			return;
		}
		$this->trackContext->recommend([
			'setTrackNumber' => $this->matches[0],
			'setTotalTracks' => $this->matches[0],
		]);
	}
}