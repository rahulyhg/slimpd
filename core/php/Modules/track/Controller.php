<?php
namespace Slimpd\Modules\track;
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
 * FITNESS FOR A PARTICULAR PURPOSE.	See the GNU Affero General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.	If not, see <http://www.gnu.org/licenses/>.
 */
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class Controller extends \Slimpd\BaseController {

/*
// track routes
$app->get("/markup/mpdplayer", 'Slimpd\Modules\track\Controller:mpdplayerAction');
$app->get("/markup/localplayer", 'Slimpd\Modules\track\Controller:localplayerAction');
$app->get("/markup/xwaxplayer", 'Slimpd\Modules\track\Controller:xwaxplayerAction');
$app->get("/markup/widget-trackcontrol", 'Slimpd\Modules\track\Controller:widgetTrackcontrolAction');
$app->get("/markup/widget-xwax", 'Slimpd\Modules\track\Controller:widgetXwaxAction');
$app->get("/markup/widget-deckselector", 'Slimpd\Modules\track\Controller:widgetDeckselectorAction');
$app->get("/markup/standalone-trackview", 'Slimpd\Modules\track\Controller:standaloneTrackviewAction');
*/
	public function widgetTrackcontrolAction(Request $request, Response $response, $args) {
		$itemParam = $request->getParam('item');
		$this->completeArgsForDetailView($itemParam, $args);
		$this->view->render($response, 'modules/widget-trackcontrol.htm', $args);
		return $response;
	}
	
	public function localplayerAction(Request $request, Response $response, $args) {
		$itemParam = $request->getParam('item');
		$this->completeArgsForDetailView($itemParam, $args);
		$args['player'] = 'local';
		$this->view->render($response, 'partials/player/permaplayer.htm', $args);
		return $response;
	}
	
	private function completeArgsForDetailView($itemParam, &$args) {
		$args['item'] = NULL;
		if(is_numeric($itemParam) === TRUE) {
			$search = array('uid' => (int)$itemParam);
			$args['item'] = $this->trackRepo->getInstanceByAttributes($search);
		}
		if($args['item'] === NULL) {
			$itemPath = trimAltMusicDirPrefix($itemParam, $this->conf);
			$search = array('relPathHash' => getFilePathHash($itemPath));
			$itemRelPath = $itemPath;
			$args['item'] = $this->trackRepo->getInstanceByAttributes($search);
		}

		if($args['item'] === NULL) {
			// track has not been imported in slimpd database yet...
			// so we are not able to get any renderitems
			$args['item'] = $this->trackRepo->getNewInstanceWithoutDbQueries($itemRelPath);
		}

		$args['renderitems'] = $this->getRenderItems($args['item']);

		// TODO: remove external liking as soon we have implemented a proper functionality
		$args['temp_likerurl'] = 'http://ixwax/filesystem/plusone?f=' .
			urlencode($this->conf['mpd']['alternative_musicdir'] . $args['item']->getRelPath());

		return;
	}
}